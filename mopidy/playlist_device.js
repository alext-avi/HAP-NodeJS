var Mopidy = require('mopidy');
var PlaylistHelper = require('../mopidy/playlist_helper').PlaylistHelper;

module.exports.PlaylistDevice = PlaylistDevice;

var mopidy = new Mopidy({
    webSocketUrl: "ws://blackberrycake:6680/mopidy/ws/"
});


var playlisthelper = new PlaylistHelper(mopidy);


// here's a fake hardware device that we'll expose to HomeKit
function PlaylistDevice (playlistName){
    this.playlist = playlistName;
    this.powerOn = false;
    this.volume = 100;

    var initialize = function() {
        mopidy.mixer.getVolume().done(this.initVolume);
    }

    var handleTrackStarted = function(object) {
        console.log("Now Playing: " + object.tl_track.track.name);
    }

    var handleTrackStopped = function(object) {
        console.log("Track stopped: " + object.tl_track.track.name);
        //this.powerOn = false;
    }

    var handlePlaylistChanged = function(object) {
        console.log("Playlist stopped: " + object);
        this.powerOn = false;
    }

    mopidy.on("state:online", initialize);
    mopidy.on("event:trackPlaybackStarted", handleTrackStarted);
    mopidy.on("event:trackPlaybackEnded", handleTrackStopped);
    mopidy.on("event:playlistChanged", handlePlaylistChanged);
    //mopidy.on(console.log.bind(console));
}

PlaylistDevice.prototype.setPowerOn = function(on) {
    if(on){
        //put your code here to turn on the fan
        if(!this.powerOn)
        {
        playlisthelper.queueAndPlay(this.playlist);
        }
        this.powerOn = on;
    }
    else{
        //put your code here to turn off the fan
        this.powerOn = on;
        mopidy.playback.stop();
    }
};

PlaylistDevice.prototype.initVolume = function(value) {
console.log("Setting fan rSpeed to %s", value);
    this.volume = value;
};

PlaylistDevice.prototype.setVolume = function(value) {
console.log("Setting fan rSpeed to %s", value);
    this.volume = value;
    mopidy.mixer.setVolume(this.volume)
};

PlaylistDevice.prototype.identify = function() {
    //put your code here to identify the fan
    console.log("Fan Identified!");

    console.log(mopidy.playback.getState());
};




