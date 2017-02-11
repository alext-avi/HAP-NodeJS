'use strict';

module.exports.PlaylistHelper = PlaylistHelper;

function PlaylistHelper(mopidy) {
    //mopidy.on(console.log.bind(console));
    this.mopidy = mopidy;

    this.printCurrentTrack = function (track) {
        if (track) {
            console.log("Currently playing:", track.name, "by",
                track.artists[0].name, "from", track.album.name);
        } else {
            console.log("No current track");
        }
    };

    this.get = function (key, object) {
        return object[key];
    };

    this.findName = function (name, object){
        var ret = object.find(x=>x.name == name);
        return ret;
    };

    this.printTypeAndName = function (model) {
        console.log(model.__model__ + ": " + model.name);
        // By returning the playlist, this function can be inserted
        // anywhere a model with a name is piped in the chain.
        return model;
    };

    this.trackDesc = function (track) {
        return track.name + " by " + track.artists[0].name +
            " from " + track.album.name;
    };

    this.printNowPlaying = function () {
        // By returning any arguments we get, the function can be inserted
        // anywhere in the chain.
        var args = arguments;
        return this.mopidy.playback.getCurrentTrack()
            .then(function (track) {
                console.log("Now playing:", this.trackDesc(track));
                return args;
            });
    };
}

PlaylistHelper.prototype.queueAndPlay = function (playlistName, trackNum) {
        trackNum = trackNum || 0;
        this.mopidy.playlists.getPlaylists()
            // => list of Playlists
            .fold(this.findName, playlistName)
            // => Playlist
            .then(this.printTypeAndName)
            // => Playlist
            .fold(this.get, 'tracks')
            // => list of Tracks
            .then(this.mopidy.tracklist.add)
            // => list of TlTracks
            .fold(this.get, trackNum)
            // => TlTrack
            .then(this.mopidy.playback.play)
            // => null
            //.then(this.printNowPlaying)
            // => null
            .catch(console.error.bind(console))  // Handle errors here
            // => null
            .done();                       // ...or they'll be thrown here
    };