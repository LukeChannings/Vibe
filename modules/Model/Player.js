/**
 * Player
 * @description 
 */
define(['require','dependencies/EventEmitter','util', 'dependencies/soundmanager2'],function(require, EventEmitter, util){

	// SM2 setup.
	soundManager.url = 'modules/dependencies/'
	soundManager.debugMode = false
	soundManager.allowScriptAccess = 'always'
	soundManager.preferFlash = true
	
	// control variables.
	var currentSound = null,
		bufferedSound = null,
		hasLoaded = false,
		identifiers = []
	
	soundManager.onready = function() {
		
		hasLoaded = true
		
	}
	
	// constructor.
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
		this.position = 0
		this.duration = 0
		this.volume = 70
		this.isBuffering = false
		this.hasLoaded = hasLoaded
		
		if ( hasLoaded )  self.emit('loaded')
		
	}
	
	// add events to Player.
	EventEmitter.augment(Player.prototype)
	
	/**
	 * plays the next track in the playlist if one exists.
	 */
	Player.prototype.playNext = function() {
	
		var nextItem = this.modelPlaylist.model.value()[this.modelPlaylist.index + 1]
	
		// check that there is a playlist item after the current item.
		if ( nextItem ) {
		
			// increment the playlist index.
			this.modelPlaylist.index++
		
			this.addSound(nextItem.trackid, true)
		
			this.modelPlaylist.ui.playingNode.removeClass('playing')
		
			this.modelPlaylist.ui.playingNode = this.modelPlaylist.ui.playingNode.nextSibling
		
			this.modelPlaylist.ui.playingNode.addClass('playing')
		
			this.isPlaying = true
		
		}
		
		else {
		
			this.modelPlaylist.ui.playingNode.removeClass('playing')
			
			this.modelPlaylist.ui.playingNode = null
		
			if ( currentSound && currentSound.hasOwnProperty('destruct') ) currentSound.destruct()
		
			this.isPlaying = false
		
		}
	
	}
	
	Player.prototype.addSound = function(id, autoplay) {
	
		if ( currentSound && currentSound.hasOwnProperty('destruct') ) currentSound.destruct() 
	
		var self = this
	
		currentSound = soundManager.createSound({
			'id' : id,
			'url' : this.getStreamUrl(id),
			'autoPlay' : autoplay || false,
			'autoLoad' : true,
			'stream' : true,
			'onpause' : function() {
			
				self.isPaused = true
				
				self.isPlaying = false
			
				self.emit('playstatechanged','pause')
			
			},
			'onresume' : function() {
			
				self.isPaused = false
				
				self.isPlaying = true
				
				self.emit('playstatechanged','play')
			
			},
			'onplay' : function() {
			
				self.isPaused = false
				
				self.isPlaying = true
			
				self.emit('playstatechanged','play')
			
			},
			'onstop' : function() {
			
				self.isPlaying = false
				sel.isPaused = false
			
				self.emit('playstatechanged','stop')
			
			},
			'onfinish' : function() {
				
				self.playNext.call(self)
				
				self.emit('playstatechanged','end')
				
			},
			'whileloading' : function() {
			
				self.emit('loading', (this.bytesLoaded / this.bytesTotal) * 100)
					
			},
			'whileplaying' : function() {
			
				// something.
			
			}
		})
	
		this.isPlaying = true
	
		return currentSound
	
	}
	
	Player.prototype.getCurrentSound = function() {
	
		return currentSound
	
	}
	
	/**
	 * play
	 * @description plays the current track.
	 */
	Player.prototype.play = function() {

		if ( currentSound instanceof Object ) currentSound.play()

		else {
		
			// get the current id.
			var id = this.modelPlaylist.getItem().trackid
		
			this.addSound(this.getStreamUrl(id), id, true)
		
		}
	
	}
	
	/**
	 * pause
	 * @description pauses the current track.
	 */
	Player.prototype.pause = function() {

		currentSound.pause()
	
	}
	
	/**
	 * stop
	 * @description stops the current track. difference from pause is that stop resets position to zero.
	 */
	Player.prototype.stop = function() {

		currentSound.stop()
	
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
	 * @description unmutes the sound.
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
	
		currentSound.setVolume(n)
	
	}
	
	Player.prototype.getStreamUrl = function(id) {
	
		var settings = this.settings
	
		return 'http://' + settings.get('host') + ':' + settings.get('port') + '/stream/' + id
	
	}
	
	return Player

})