var should = require('should');
var AVReceiver = require('../lib/avreceiver');

describe('AVReceiver', function(){
  var receiver = new AVReceiver('10.0.1.3');

  beforeEach(function() {
    receiver.setPowerState(true);
  });

  describe('#getStatus', function(){
    it('should return valid status', function(){
      return receiver.getState()
      .then(function(status) {
        status.should.have.property('power');
        status.should.have.property('mute');
      });
    })
  });

  describe('power functions', function() {
    it('should power off', function() {
      this.timeout(4000)
      return receiver.setPowerState(false)
      .then(function() {
        return receiver.getPowerState();
      }).then(function(state) {
        state.should.be.false
      });
    })
  });

  describe('#getStateFor', function(){
    it('should return state for mute', function(){
      return receiver.getStateFor('mute')
      .then(function(state) {
        (state !== undefined).should.be.ok;
      });
    })
  });

  describe('#setMuteState', function(){
    
    it('should set mute to true', function() {
      return receiver.setMuteState(true)
      .then(function() {
        return receiver.getMuteState();
      }).then(function(muteState) {
        muteState.should.be.true;
      });
    });

    it('should set mute to false', function(){
      return receiver.setMuteState(false)
      .then(function(status) {
        return receiver.getMuteState();
      }).then(function(muteState) {
        muteState.should.be.false;
      });
    });

  });
});