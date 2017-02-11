var Mopidy = require('mopidy');
var PlaylistHelper = require('../mopidy/playlist_helper').PlaylistHelper;

var mopidy = new Mopidy({
    webSocketUrl: "ws://blackberrycake:6680/mopidy/ws/"
});


var playlisthelper = new PlaylistHelper(mopidy);

// here's a fake hardware device that we'll expose to HomeKit
var PlaylistDevice = function(){
    powerOn = false;
    rSpeed = 100;

    var initializeFanState = function() {
        mopidy.mixer.getVolume().done(FAKE_FAN.setSpeed);
    }

    var handleTrackStarted = function(object) {
        console.log("Now Playing: " + object.tl_track.track.name);
    }

    mopidy.on("state:online", initializeFanState);
    mopidy.on("event:trackPlaybackStarted", handleTrackStarted);
}

PlaylistDevice.prototype.setPowerOn = function(on) {
    if(on){
        //put your code here to turn on the fan
        if(!FAKE_FAN.powerOn)
        {
        playlisthelper.queueAndPlay("ROCK A BYE BABY (by 1166790265)");
        }
        FAKE_FAN.powerOn = on;
    }
    else{
        //put your code here to turn off the fan
        FAKE_FAN.powerOn = on;
        mopidy.playback.stop();
    }
};

PlaylistDevice.prototype.setSpeed = function(value) {
console.log("Setting fan rSpeed to %s", value);
    this.rSpeed = value;
    mopidy.mixer.setVolume(FAKE_FAN.rSpeed)
};

PlaylistDevice.prototype.identify = function() {
    //put your code here to identify the fan
    console.log("Fan Identified!");

    console.log(mopidy.playback.getState());
};




