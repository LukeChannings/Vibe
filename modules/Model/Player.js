define(['require','dependencies/EventEmitter','util'], function(require, EventEmitter, util) {

	// control variables.
	var currentSound = null
	
	/**
	 * constructs a new player model.
	 * @param options {object} instance configuration options.
	 */
	var Player = function(options) {
	
		var options = options || {},
		
		self = this
	
		if ( ! options.withSettings ) throw util.error('Missing settings instance.')
		else this.settings = options.withSettings
		
		if ( ! options.withModelPlaylist ) throw util.error('Missing model playlist instance.')
		else this.modelPlaylist = options.withModelPlaylist
		
		if ( !options.withUI ) throw util.error('Missing player interface instance.')
		else this.uiPlayer = options.withUI
		
		// properties.
		this.isMuted = false
		this.isPlaying = false
		this.isPaused = false
		this.volume = typeof this.settings.get('volume') == 'number' ? this.settings.get('volume') : 70
		
		// UI Events.
		this.uiPlayer.on('playtoggle', function(button) {
			
			self.playToggle(button)
			
		})
		
		this.uiPlayer.on('skip', function(direction) {
		
			self.skip(direction)
		
		})
		
		this.uiPlayer.on('seek', function(position) {
		
			self.seek(position * currentSound.realDuration)
		
		})
		
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
	
		var duration = this.modelPlaylist.model[this.modelPlaylist.index].tracklength
	
		// set the duration for the item in milliseconds.
		currentSound.realDuration = Math.floor(duration * 1000)

		this.uiPlayer.playerSlider.updateDuration(duration)

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
			
			this.uiPlayer.controls.buttons.buttons.play_pause.node.addClass('pause')
			
			this.emit('play')
	
		}
	
		this.onpause = function() {
		
			this.isPaused = true
				
			this.isPlaying = false
		
			this.uiPlayer.controls.buttons.buttons.play_pause.node.removeClass('pause')
		
			this.emit('pause')
		
		}
	
		this.onstop = function() {
		
			this.isPlaying = false
			
			this.isPaused = false
		
			this.uiPlayer.playerSlider.updateDuration(0)
			
			this.uiPlayer.playerSlider.updateProgress(0,0)
			
			this.uiPlayer.playerSlider.updateBuffer(0)
		
			this.emit('stop')
		
		}
		
		this.onfinish = function() {
		
			this.isPlaying = false
			
			this.isPaused = false
		
			this.skip.call(this)
			
			this.emit('end')
		
		}
		
		this.whileplaying = function() {
		
			var progress = this.currentSound.position, duration = this.currentSound.realDuration
		
			this.uiPlayer.playerSlider.updateProgress(progress / duration, progress / 1000)

		}
	
		this.whileloading = function() {
		
			this.uiPlayer.playerSlider.updateBuffer((this.currentSound.bytesLoaded / this.currentSound.bytesTotal) * 100)
		
		}
	
		return this
	
	}).call({})
	
	/**
	 * skips to the next or previous track.
	 * @param direction {boolean} true for previous, false for next.
	 */
	Player.prototype.skip = function(direction) {
	
		var direction = direction = direction === true ? -1 : 1, // determine index operand.
			modelPlaylist = this.modelPlaylist, // alias modelPlaylist.
			uiPlaylist = modelPlaylist.ui, // alias uiPlaylist.
			model = modelPlaylist.model, // alias the UndoManager instance.
			index = modelPlaylist.index + direction, // get the index.
			node = undefined // initialise node to undefined.
	
		// if there is no currently playing node, set it to the first item in the playlist.
		if ( !uiPlaylist.playingNode ) node = uiPlaylist.list.firstChild
	
		// otherwise, use the direction to determine whether to use the next or previous item.
		else node = direction === -1 ? uiPlaylist.playingNode.previousSibling : uiPlaylist.playingNode.nextSibling

		// set the index.
		modelPlaylist.setIndex(index, node)
	
		// if the index isn't in the playlist..
		if ( index < 0 || index >= model.length ) {
		
			// destruct the current SMSound object.
			currentSound && currentSound.destruct()
	
			currentSound = this.currentSound = undefined
	
			// call the stop event.
			this.Events.onstop.call(this)

		}

		// otherwise add a new sound.
		else this.addSound(model[index].trackid, true)

	}
	
	/**
	 * play
	 * @description plays the current track.
	 */
	Player.prototype.play = function() {

		if ( currentSound ) currentSound.play()
	
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
	
		currentSound && currentSound.setVolume(n)
	
	}
	
	/**
	 * toggles the play/pause state.
	 */
	Player.prototype.playToggle = function(button) {
	
		if ( this.isPlaying ) {
		
			currentSound.pause()
		
			button.removeClass('pause')
		
		}
		
		else {
		
			this.play()
	
			button.addClass('pause')
	
		}
	
	}
	
	/**
	 * seeks to the position in the track.
	 * @param position {number} position in milliseconds.
	 */
	Player.prototype.seek = function(position) {
	
		currentSound.setPosition(position)
	
	}
	
	// add events to Player.
	EventEmitter.augment(Player.prototype)
	
	return Player

})