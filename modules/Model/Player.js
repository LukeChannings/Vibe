/**
 * Player
 * @description 
 */
define(['require','dependencies/EventEmitter','dependencies/soundmanager2'],function(require, EventEmitter){

	// SM2 setup.
	soundManager.url = '../modules/dependencies/';
	soundManager.debugMode = true;
	soundManager.allowScriptAccess = 'always';
	
	// control variables.
	var currentSound = null,
		bufferedSound = null,
		hasLoaded = false,
		identifiers = [];
	
	soundManager.onready = function() {
		
		hasLoaded = true;
		
	}
	
	// constructor.
	var Player = function() {
	
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
	
	Player.prototype.addSound = function(src) {
	
		console.log(src);
	
		// destroy preexisting SMSounds.
		if ( soundManager.getSoundById('currentSound') ) soundManager.getSoundById('currentSound').destroy();
	
		return soundManager.createSound({
			'id' : "currentSound",
			'url' : src,
			'volume' : this.volume,
			'autoPlay' : false,
			'autoLoad' : true,
			'stream' : true
		});
	
	}
	
	/**
	 * play
	 * @description plays the current track.
	 */
	Player.prototype.play = function() {
	
		this.isPlaying = true;
		this.isPaused = false;
	
		currentSound.play();
	
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
	
	return Player;

});