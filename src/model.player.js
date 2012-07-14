define(['util', 'api.webkitNotifications', 'dom.animator'], function(util, webkitNotifications, Animator) {

	// control variables.
	var currentSound = null
	
	/**
	 * constructs a new player model.
	 * @param options {object} instance configuration options.
	 */
	var Player = function(options) {
	
		var options = options || {},
		
		self = this
	
		if ( ! options.withSettings ) {
			throw new Error('Missing settings instance.')
		} else {
			this.settings = options.withSettings
		}
		
		if ( ! options.withPlaylistModel ) {
			throw new Error('Missing model playlist instance.')
		} else {
			this.playlistModel = options.withPlaylistModel
		}
		
		if ( ! options.withUI ) {
			throw new Error('Missing player interface instance.')
		} else {
			this.playerInterface = options.withUI
		}
		
		// properties.
		this.isMuted = false
		this.isPlaying = false
		this.isPaused = false
		this.volume = ( typeof this.settings.get('volume') == 'number' ) ? this.settings.get('volume') : 80
		this.icon = document.getElementsByTagName('head')[0].getElementsByTagName('link')[1]
		
		// set the volume bar to reflect the volume setting.
		setTimeout(function() {
			self.playerInterface.playerVolumeControl.dragdealer.setValue(self.volume / 100)
		}, 150)
		
		// UI Events.
		this.playerInterface.onplaytoggle = function(button) {
		
			self.playToggle(button)
		}
		
		this.playerInterface.onskip = function(direction) {
		
			self.skip(direction)
		}
		
		this.playerInterface.onseek = function(position) {
		
			console.log(position)
		
			self.seek(position)
		}
		
		this.playerInterface.onvolumechange = function(n) {
		
			self.setVolume(n)
		}
		
		options.onload && options.onload(self)
	}
	
	/**
	 * adds the sound to the player.
	 * @param id {string} the identifier for the track.
	 * @param autoplay {boolean} will automatically start playing the track if true.
	 */
	Player.prototype.addSound = function(id, autoplay) {
	
		// destroy the current sound instance.
		if ( currentSound && currentSound.hasOwnProperty('destruct') ) {
			currentSound.destruct() 
		}
	
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
	
		var duration = this.playlistModel.model[this.playlistModel.index].tracklength
	
		// set the duration for the item in milliseconds.
		currentSound.realDuration = Math.floor(duration * 1000)

		this.playerInterface.playerSlider.updateDuration(duration)
		
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

			util.addClass(
				this.playerInterface.controls.buttons.buttons.play_pause.node,
				'pause'
			)
			
			var metadata = this.playlistModel.model[this.playlistModel.index]
			
			if ( this.settings.get('notifications') ) {
				webkitNotifications.presentNotificationWithMetadata(metadata)
			}
			
			this.playerInterface.playingInfo.update(metadata)
			
			document.title = metadata.trackname + " by " + metadata.artistname
			
			this.icon.setAttribute('href', 'images/shared.status.playing.png')
			
			util.addClass(
				this.playerInterface.playingInfo.node,
				'visible'
			)
			
			this.onplay && this.onplay()
		}
	
		this.onpause = function() {
		
			this.isPaused = true
				
			this.isPlaying = false

			util.removeClass(
				this.playerInterface.controls.buttons.buttons.play_pause.node, 
				'pause'
			)
			
			this.icon.setAttribute('href', 'images/shared.status.paused.png')
		
			this.onpause && this.onpause()
		}
	
		this.onstop = function() {
		
			this.isPlaying = false
			
			this.isPaused = false
		
			this.playerInterface.playerSlider.updateDuration(0)
			
			this.playerInterface.playerSlider.updateProgress(0,0)
			
			this.playerInterface.playerSlider.updateBuffer(0)

			util.removeClass(
				this.playerInterface.controls.buttons.buttons.play_pause.node, 
				'pause'
			)
			
			util.removeClass(
				this.playerInterface.playingInfo.node,
				'visible'
			)

			this.icon.setAttribute('href', 'images/shared.icon_16.png')

			document.title = "Vibe"

			this.onstop && this.onstop()
		}
		
		this.onfinish = function() {
		
			this.isPlaying = false
			
			this.isPaused = false
		
			this.skip(1)
			
			util.removeClass(
				this.playerInterface.playingInfo.node,
				'visible'
			)
			
			this.onend && this.onend()
		}
		
		this.whileplaying = function() {
		
			var progress = this.currentSound.position,
				duration = this.currentSound.realDuration
		
			this.playerInterface.playerSlider.updateProgress(
				progress / duration,
				progress / 1000
			)
		}
	
		this.whileloading = function() {
		
			this.playerInterface.playerSlider.updateBuffer(
				(this.currentSound.bytesLoaded / this.currentSound.bytesTotal) * 100
			)
		}
	
		return this
	
	}).call({})
	
	/**
	 * skips to the next or previous track.
	 * @param direction {boolean} true for previous, false for next.
	 */
	Player.prototype.skip = function(direction) {

		var playlistModel = this.playlistModel,
			playlistInterface = playlistModel.ui,
			model = playlistModel.model,
			index = playlistModel.index + direction
			playingNode = undefined // contains the currently playing row.
		
		if ( ! playlistInterface.playingNode ) {
			playingNode = playlistInterface.list.node.firstChild
			index = 0
		} else {
			playingNode = ( direction == -1 ) 
			? playlistInterface.playingNode.previousSibling
			: playlistInterface.playingNode.nextSibling
		}
		
		playlistModel.setIndex(index, playingNode)
		
		// if the index is in the model
		// then add the sound.
		if ( model[index] ) {
		
			this.addSound(model[index].trackid, true)

		} else {
			
			// if the index is out of bounds
			// then destroy the current sound
			// and call the stop event.
			currentSound && currentSound.destruct()
	
			currentSound = this.currentSound = undefined

			this.Events.onstop.call(this)
		}
	}
	
	/**
	 * plays the current track.
	 */
	Player.prototype.play = function() {

		console.log('play.')

		if ( currentSound ) {
			
			currentSound.play()
			
		} else {
		
			this.playlistModel.setIndex(
				0,
				this.playlistModel.ui.list.node.firstChild
			)

			util.addClass(this.playlistModel.ui.playingNode, 'playing')
		
			this.addSound(this.playlistModel.getItem().trackid, true)
		}
	}

	/**
	 * mutes the sound.
	 */
	Player.prototype.mute = function() {
	
		this.isMuted = true
	
		this.setVolume(0)
	}
	
	/**
	 * un mutes the sound.
	 */
	Player.prototype.unMute = function() {
	
		this.isMuted = false
	
		this.setVolume(1)
	}
	
	/**
	 * sets a new volume for the sound.
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
		} else {
		
			this.play()
		}
	}
	
	/**
	 * seeks to the position in the track.
	 * @param position {number} position in milliseconds.
	 */
	Player.prototype.seek = function(position) {
	
		console.log(position)
	
		currentSound.setPosition(position * currentSound.realDuration)
	}

	return Player
})