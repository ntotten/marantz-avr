let request = require('request');
let parseXmlString = require('xml2js').parseString;
let qs = require('querystring');
let RateLimiter = require('limiter').RateLimiter;

const STATUS_URL = '/goform/formMainZone_MainZoneXml.xml';
const POST_URL = '/index.put.asp';
let AVReceiver = function (ipAddress) {
  this.ipAddress = ipAddress
  this.limiter = new RateLimiter(1, 250);
}

AVReceiver.Sources = {
  GAME: 'GAME',
  CBL_SAT: 'SAT/CBL',
  NETWORK: 'NET',
  USB: 'USB/IPOD',
  TUNER: 'TUNER',
  DVD: 'DVD',
  BLUERAY: 'BD',
  HD_RADIO: 'HDRADIO',
  AUX1: 'AUX1',
  AUX2: 'AUX2',
  MEDIA_PLAYER: 'MPLAY',
  TV: 'TV',
  PHONO: 'PHONO',
  INTERNET_RADIO: 'IRADIO',
  MXPORT: 'M-XPORT',
  NETHOME: 'NETHOME'
};

AVReceiver.SurroundModes = {
  MOVIE: 'MOVIE',
  MUSIC: 'MUSIC',
  GAME: 'GAME',
  PURE_DIRECT: 'PURE DIRECT',
  DIRECT: 'DIRECT',
  STEREO: 'STEREO',
  STANDARD: 'STANDARD',
  SIMULATION: 'SIMULATION',
  AUTO: 'AUTO',
  LEFT: 'LEFT'
};

AVReceiver.prototype.getState = function () {
  let convertStatusToModel = function (status) {
    let getValue = function (name) {
      var value = status.item[name]==undefined?value='OFF':status.item[name][0];
      if (typeof value === 'object' && Array.isArray(value)) {
        if (value.length === 1) {
          value = value[0];
        }
      }
      if (typeof value === 'string') {
        value = value.toUpperCase().trim();
      }

      if (value === 'ON') {
        value = true;
      } else if (value === 'OFF') {
        value = false;
      } else if (value === 'STANDBY') {
        value = false;
      }

      return value;
    }

    let model = {
      power: getValue('Power'),
      input: getValue('InputFuncSelect'),
      volumeLevel: getValue('MasterVolume'),
      mute: getValue('Mute'),
      surroundMode: getValue('selectSurround')
    }
    return model;
  }
  return new Promise((function (resolve, reject) {
    this._request({
      url: `http://${this.ipAddress}${STATUS_URL}`
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        parseXmlString(body, function (err, result) {
          let model = convertStatusToModel(result);
          resolve(model);
        });
      } else {
        reject(err);
      }
    })
  }).bind(this));
};

AVReceiver.prototype.sendCommand = function (cmd) {
  return new Promise((function (resolve, reject) {
    let body = qs.stringify({ cmd0: cmd });
    this._request({
      url: `http://${this.ipAddress}/MainZone${POST_URL}`,
      method: 'POST',
      headers: {
        'Content-type': 'text/html'
      },
      body: body
    }, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        resolve();
      } else {

        reject(err);
      }
    })
  }).bind(this));
};

AVReceiver.prototype.getStateFor = function (name) {
  return new Promise((function (resolve, reject) {
    this.getState().then(function (state) {
      resolve(state[name]);
    }, function (err) {
      reject(err);
    });
  }).bind(this));
}

AVReceiver.prototype.setMuteState = function (muted) {
  return this.sendCommand('PutVolumeMute/' + (muted ? 'on' : 'off'));
};

AVReceiver.prototype.getMuteState = function () {
  return this.getStateFor('mute');
}

AVReceiver.prototype.volumeDown = function (level) {
  return this.sendCommand('PutMasterVolumeBtn/<');
}

AVReceiver.prototype.volumeUp = function (level) {
  return this.sendCommand('PutMasterVolumeBtn/>');
}

AVReceiver.prototype.setVolumeLevel = function (level) {
  return this.sendCommand('PutMasterVolumeSet/' + level);
}

AVReceiver.prototype.getVolumeLevel = function () {
  return this.getStateFor('volumeLevel');
}

AVReceiver.prototype.setInputSource = function (source) {
  return this.sendCommand('PutZone_InputFunction/' + source);
}

AVReceiver.prototype.getInputSource = function () {
  return this.getStateFor('input');
}

AVReceiver.prototype.setSurroundMode = function (surroundMode) {
  return this.sendCommand('PutSurroundMode/' + surroundMode);
}

AVReceiver.prototype.getSurroundMode = function () {
  return this.getStateFor('surroundMode');
}

AVReceiver.prototype.setPowerState = function (state) {
  return new Promise((resolve, reject) => {
    this.sendCommand('PutZone_OnOff/' + (state ? 'ON' : 'OFF'))
      .then(function () {
        // Power state takes a long time so we wait a bit
        setTimeout(resolve, 1000);
      }, reject);
  });
}

AVReceiver.prototype.getPowerState = function () {
  return this.getStateFor('power');
}

AVReceiver.prototype._request = function (options, callback) {
  this.limiter.removeTokens(1, function () {
    request(options, callback);
  });
}

module.exports = AVReceiver;
