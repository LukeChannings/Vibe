/**
 * ModelInit
 * @description Defines initialisation routines for the User Interface. A delegee for the controller.
 */
define(['util'],function(util){

	var initialise = {
		playlist : function(callback) {
		
			var self = this
		
			require(['Model/Playlist', 'UI/Playlist/Playlist'], function(ModelPlaylist, UIPlaylist) {
			
				var playlist = self.playlist = new UIPlaylist({
					useInfoBar : true,
					useControlBar : [{
						'isIcon' : true,
						'customClass' : 'undo',
						'callback' : function() {
							self.modelPlaylist.undo()
						}
					},{
						'isIcon' : true,
						'customClass' : 'redo',
						'callback' : function() {
							self.modelPlaylist.redo()
						}
					},{
						'isIcon' : true,
						'customClass' : 'clear',
						'callback' : function() {
							self.modelPlaylist.clear()
						}
					},{
						'isIcon' : true,
						'customClass' : 'settings',
						'floatRight' : true,
						'callback' : function() {
							self.uiSettings.show()
						}
					}]
				})
			
				playlist.on('loaded', function() {
				
					self.modelPlaylist = new ModelPlaylist({
						'withUI' : playlist,
						'withApi' : self.api
					})
					
					callback()
				
				})
				
				playlist.on('playItem', function(id, node) {
					
					if ( self.modelPlayer.currentSound && self.modelPlayer.currentSound.sID == id ) return
					
					node.removeClass('selected')
					
					self.modelPlaylist.setIndex(self.modelPlaylist.indexOfTrackId(id), node)
					
					self.modelPlayer.addSound(id, true)
				
				})
			
			})
		
		},
		collection : function(callback) {
		
			var self = this
		
			require(['UI/Collection/Collection'], function(UICollection) {
			
				var collection = self.collection = new UICollection({
					withApi : self.api,
					useSearch : true,
					useInfoBar : true,
					dragAndDropElement : self.playlist.node,
					withRootType : self.settings.get('collectionRootType') || 'genre'
				})
			
				collection.on('loaded', function() {
				
					callback && callback()
				
				})
				
				collection.on('itemSelected', function(item) {
				
					self.modelPlaylist.add(item.type, item.id)
					
				})
			
			})
		
		},
		player : function(callback) {
		
			var self = this
		
			require(['Model/Player', 'UI/Player/Player'], function(ModelPlayer, UIPlayer) {
			
				var modelPlayer = self.modelPlayer = new ModelPlayer({
					'withSettings' : self.settings,
					'withModelPlaylist' : self.modelPlaylist
				})
			
				modelPlayer.on('loading', function(progress) {
				
					self.player.emit('bufferupdate', progress)
				
				})
				
				modelPlayer.on('progress', function(progress, duration) {
				
					var position = progress / duration
					
					self.player.emit('trackupdate', position)
				
				})
			
				modelPlayer.on('playstatechanged', function(state) {
				
					self.player.emit('playstatechanged', state)
				
				})
			
				var player = self.player = new UIPlayer({
					'withControls' : [],
					'withSlider' : true
				})
				
				player.on('loaded', function() {
				
					callback && callback()
				
				})
				
				player.on('playtoggle', function(button) {
				
					if ( self.modelPlayer.isPlaying ) {
					
						self.modelPlayer.currentSound.pause()
					
					}
				
					else {
					
						self.modelPlayer.play()
					
					}
					
				})
				
				player.on('skip', function(direction) {
				
					self.modelPlayer.skip(direction)
				
				})
				
				player.on('seek', function(position) {
				
					var position = position * modelPlayer.currentSound.realDuration
				
					if ( position > 0 && position < modelPlayer.currentSound.realDuration ) {
					
						self.modelPlayer.currentSound.setPosition(position)
					
					}
				
				})
				
			})
		
		},
		desktop : function() {
		
			var self = this
		
			initialise.playlist.call(this, function() {
			
				initialise.collection.call(self, function() {
				
					initialise.player.call(self, function() {
					
						if ( util.Browser.HasSupport.cssTransitions() ) {
						
							require(['UI/Animator/Animator'], function(UIAnimator) {
							
								document.body.removeClass('loading')
							
								self.rootNode.appendChildren([self.player.node, self.collection.node, self.playlist.node])
								
								new UIAnimator(self.player.node, 'fadeIn', 0.5)
							
								new UIAnimator(self.collection.node, 'fadeIn', 0.5)
								
								new UIAnimator(self.playlist.node, 'fadeIn', 0.5)
							
							})
						
						}
						else {
						
							document.body.removeClass('loading')
						
							self.rootNode.appendChildren([self.player.node, self.collection.node, self.playlist.node])
						}
					})
				
				})
			
			})
		
		},
		mobile : function() {
		
			document.body.innerHTML += "<h1 style='text-align: center'>Mobile UI is not yet implemented.</h1>"
		
		}
	}

	return initialise

})