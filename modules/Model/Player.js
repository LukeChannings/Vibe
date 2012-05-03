/**
 * Player
 * @description 
 */
define(['require','dependencies/EventEmitter','util', 'dependencies/soundmanager2'],function(require, EventEmitter, util){

	// SM2 setup.
	soundManager.url = 'modules/dependencies/';
	soundManager.debugMode = false;
	soundManager.allowScriptAccess = 'always';
	soundManager.preferFlash = true;
	
	// control variables.
	var currentSound = null,
		bufferedSound = null,
		hasLoaded = false,
		identifiers = [];
	
	soundManager.onready = function() {
		
		hasLoaded = true;
		
	}
	
	// constructor.
	var Player = function(options) {
	
		var options = options || {};
	
		if ( ! options.withSettings ) throw util.error('Missing settings instance.');
		else this.settings = options.withSettings;
		
		if ( ! options.withModelPlaylist ) throw util.error('Missing model playlist instance.');
		else this.modelPlaylist = options.withModelPlaylist;
		
		// properties.
		this.isMuted = false;
		this.isPlaying = false;
		this.isPaused = false;
		this.position = 0;
		this.duration = 0;
		this.volume = 70;
		this.isBuffering = false;
		this.hasLoaded = hasLoaded;
		
		if ( hasLoaded ) {
			self.emit('loaded');
		}
		
	}
	
	// add events to Player.
	EventEmitter.augment(Player.prototype);
	
	/**
	 * playNext
	 * @description plays the next track in the playlist if one exists.
	 */
	var playNext = function() {
	
		var self = this;
		
		this.modelPlaylist.index++;
		
		var id = this.modelPlaylist.getItem().trackid;
	
		console.log(id);
	
		self.addSound(this.getStreamUrl(id), id, true);
	
	}
	
	Player.prototype.addSound = function(src, id, autoplay) {
	
		if ( currentSound && currentSound.hasOwnProperty('destruct') ) currentSound.destruct(); 
	
		currentSound = soundManager.createSound({
			'id' : id,
			'url' : src,
			'autoPlay' : autoplay || false,
			'autoLoad' : true,
			'stream' : true,
			'onfinish' : playNext
		});
	
		return currentSound;
	
	}
	
	Player.prototype.getCurrentSound = function() {
	
		return currentSound;
	
	}
	
	/**
	 * play
	 * @description plays the current track.
	 */
	Player.prototype.play = function() {
	
		this.isPlaying = true;
		this.isPaused = false;
	
		if ( currentSound instanceof Object ) currentSound.play();
		else {
		
			// get the current id.
			var id = this.modelPlaylist.getItem().trackid;
		
			this.addSound(this.getStreamUrl(id), id, true);
		
		}
	
	}
	
	/**
	 * pause
	 * @description pauses the current track.
	 */
	Player.prototype.pause = function() {
	
		this.isPlaying = false;
		this.isPaused = true;
	
		console.log(currentSound);
	
		currentSound.pause();
	
	}
	
	/**
	 * stop
	 * @description stops the current track. difference from pause is that stop resets position to zero.
	 */
	Player.prototype.stop = function() {
	
		this.isPlaying = false;
		this.isPaused = false;
	
		currentSound.stop();
	
	}
	
	/**
	 * mute
	 * @description mutes the sound.
	 */
	Player.prototype.mute = function() {
	
		this.isMuted = true;
	
		currentSound.mute();
	
	}
	
	/**
	 * unMute
	 * @description unmutes the sound.
	 */
	Player.prototype.unMute = function() {
	
		this.isMuted = false;
	
		currentSound.unmute();
	
	}
	
	/**
	 * setVolume
	 * @description sets a new volume for the sound.
	 * @param n - volume integer between 0 and 100.
	 */
	Player.prototype.setVolume = function(n) {
	
		this.volume = n;
	
	}
	
	Player.prototype.getStreamUrl = function(id) {
	
		var settings = this.settings;
	
		return 'http://' + settings.get('host') + ':' + settings.get('port') + '/stream/' + id;
	
	}
	
	return Player;

});