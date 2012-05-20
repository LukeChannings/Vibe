define(['require','dependencies/EventEmitter','util', 'dependencies/soundmanager2'], function(require, EventEmitter, util) {

	// SM2 setup.
	soundManager.url = 'modules/dependencies/'
	soundManager.debugMode = false
	soundManager.allowScriptAccess = 'always'
	soundManager.preferFlash = true
	
	// control variables.
	var currentSound = null
	
	/**
	 * constructs a new player model.
	 * @param options {object} instance configuration options.
	 */
	var Player = function(options) {
	
		var options = options || {}
	
		if ( ! options.withSettings ) throw util.error('Missing settings instance.')
		else this.settings = options.withSettings
		
		if ( ! options.withModelPlaylist ) throw util.error('Missing model playlist instance.')
		else this.modelPlaylist = options.withModelPlaylist
		
		// properties.
		this.isMuted = false
		this.isPlaying = false
		this.isPaused = false
		this.volume = typeof this.settings.get('volume') == 'number' ? this.settings.get('volume') : 70
		
	}
	
	/**
	 * skips to the next or previous track.
	 * @param direction {boolean} true for previous, false for next.
	 */
	Player.prototype.skip = function(direction) {
	
		// convert the direction.
		var direction = direction === true ? -1 : 1
	
	}
	
	/**
	 * adds the sound to the player.
	 * @param id {string} the identifier for the track.
	 * @param autoplay {boolean} will automatically start playing the track if true.
	 */
	Player.prototype.addSound = function(id, autoplay) {
	
		// destroy the current sound instance.
		if ( currentSound && currentSound.hasOwnProperty('destruct') ) currentSound.destruct() 
	
		// define the new sound.
		var sound = {
			'id' : id,
			'url' : 'http://' + this.settings.get('host') + ':' + this.settings.get('port') + '/stream/' + id,
			'autoPlay' : !!autoplay || false,
			'autoLoad' : true,
			'stream' : true,
			'volume' : this.volume,
		}
		
		// add the player events to the sound.
		util.augment(sound, this.Events, this)
	
		// create the SMSound object.
		currentSound = this.currentSound = soundManager.createSound(sound)
	
		// set the duration for the item in milliseconds.
		currentSound.realDuration = Math.floor(this.modelPlaylist.getItem().tracklength * 1000)

		// return the newly created sound.
		return currentSound

	}
	
	/**
	 * SMSound event handler methods.
	 */
	Player.prototype.Events = (function() {
	
		this.onplay = this.onresume = function() {
			
			this.isPaused = false
				
			this.isPlaying = true
			
			this.emit('playstatechanged','play')
	
		}
	
		this.onpause = function() {
		
			this.isPaused = true
				
			this.isPlaying = false
		
			this.emit('playstatechanged','pause')
		
		}
	
		this.onstop = function() {
		
			this.isPlaying = false
			this.isPaused = false
		
			this.emit('playstatechanged','stop')
		
		}
		
		this.onfinish = function() {
		
			this.skip.call(this)
			
			this.emit('playstatechanged','end')
		
		}
		
		this.whileplaying = function() {
		
			this.emit('progress', this.currentSound.position, this.currentSound.realDuration)
		
		}
	
		this.whileloading = function() {
		
			this.emit('loading', (this.currentSound.bytesLoaded / this.currentSound.bytesTotal) * 100)
		
		}
	
		return this
	
	}).call({})
	
	/**
	 * play
	 * @description plays the current track.
	 */
	Player.prototype.play = function() {

		if ( currentSound !== null ) currentSound.play()
	
		else {
		
			this.modelPlaylist.index = 0
		
			this.modelPlaylist.ui.playingNode = this.modelPlaylist.ui.list.firstChild
		
			this.modelPlaylist.ui.playingNode.addClass('playing')
		
			this.addSound(this.modelPlaylist.getItem().trackid, true)
		
		}
	
	}

	/**
	 * mute
	 * @description mutes the sound.
	 */
	Player.prototype.mute = function() {
	
		this.isMuted = true
	
		currentSound.mute()
	
	}
	
	/**
	 * unMute
	 * @description un mutes the sound.
	 */
	Player.prototype.unMute = function() {
	
		this.isMuted = false
	
		currentSound.unmute()
	
	}
	
	/**
	 * setVolume
	 * @description sets a new volume for the sound.
	 * @param n - volume integer between 0 and 100.
	 */
	Player.prototype.setVolume = function(n) {
	
		this.volume = n
	
		this.settings.set('volume', n)
	
		currentSound.setVolume(n)
	
	}
	
	// add events to Player.
	EventEmitter.augment(Player.prototype)
	
	return Player

})