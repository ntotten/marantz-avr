var should = require('should');
var AVReciever = require('../lib/avreciever');

describe('AVReciever', function(){
  var reciever = new AVReciever('10.0.1.3');

  describe('#getStatus', function(){
    it('should return valid status', function(){
      return reciever.getState()
      .then(function(status) {
        status.should.have.property('power');
        status.should.have.property('mute');
      });
    })
  });

  describe('power functions', function() {
    it('should power cycle', function() {
      this.timeout(4000)
      var initialPowerState;
      return reciever.getPowerState()
      .then(function(isPoweredOn) {
        initialPowerState = isPoweredOn;
        console.log(isPoweredOn)
        if (isPoweredOn) {
          return reciever.powerOff();
        } else {
          return reciever.powerOn();
        }
      }).then(function() {
        return reciever.getPowerState();
      }).then(function(isPoweredOn) {
        console.log(isPoweredOn)
        isPoweredOn.should.not.eql(initialPowerState);
      });
    })
  });

  describe('#getStateFor', function(){
    it('should return state for mute', function(){
      return reciever.getStateFor('mute')
      .then(function(state) {
        (state !== undefined).should.be.ok;
      });
    })
  });

  describe('#setMuteState', function(){
    
    it('should set mute to true', function() {
      return reciever.setMuteState(true)
      .then(function() {
        return reciever.getMuteState();
      }).then(function(muteState) {
        muteState.should.be.true;
      });
    });

    it('should set mute to false', function(){
      return reciever.setMuteState(false)
      .then(function(status) {
        return reciever.getMuteState();
      }).then(function(muteState) {
        muteState.should.be.false;
      });
    })
  });
});