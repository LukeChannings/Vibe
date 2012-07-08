/*
// User Interface Initialiser.
// responsible for fetching and initialising modules for either a 
// Desktop or Mobile interface and creating an instance of these
// modules in sequence.
*/
define(function(require) {
	
	// dependencies.
	var util = require('util'),
		Collection = require('ui.collection'),
		Playlist = require('ui.playlist'),
		PlaylistModel = require('model.playlist'),
		Player = require('ui.player'),
		PlayerModel = require('model.player'),
		SettingsAssistant = require('ui.settingsAssistant')
	
	// interfaces.
	var collection,
		playlist,
		player,
	
	// data models.
	playlistModel,
	playerModel,
	
	// the root element.
	vibe = document.getElementById('Vibe'),
	
	// the api instance.
	api = null,
	
	// the settings instance.
	settings = null,
	
	// the settings interface.
	settingsAssistant = null,
	
	// reference to current object.
	self,
	
	// initialisation stages.
	stage = {
		collection : function (callback) {

			new Collection({
				withApi : api,

				onitemselect : function(item) {
				
					playlistModel.add(item.type, item.id)
				},
				
				ondatadrop : function() {
				
					// handle data dropping.
				},
				
				dragAndDropElement : playlist.node,
				
				withRootType : settings.get('collectionRootType') || 'genre',
				
				onload : function(CollectionInstance) {
				
					self.collection = collection = CollectionInstance
					
					callback && callback()
				}
			})
		},
		
		playlist : function(callback) {
		
			// configure the playlist.
			new Playlist({
				withControlBarButtons : [{
					isIcon : true,
					customClass : 'undo',
					callback : function() {
						playlistModel.undo()
					}
				},{
					isIcon : true,
					customClass : 'redo',
					callback : function() {
						playlistModel.redo()
					} 
				},{
					isIcon : true,
					customClass : 'clear',
					callback : function() {
						playlistModel.clear()
					}
				},{
					isIcon : true,
					customClass : 'settings',
					floatRight : true,
					callback : function () {
						settingsAssistant.presentDialogue()
					}
				}],
				onplayitem : function(row) {

					util.removeClass(row.node, 'selected')
					
					playlistModel.setIndex(
						playlistModel.indexOfTrackId(row.id),
						row.node
					)
					
					playerModel.addSound(row.id, true)
				},
				onchange : function() {
				
					if ( playlistModel ) {
					
						playlistModel.updateInfo()
						
						playlistModel.updateButtons()
					}
				},
				onload : function(PlaylistInstance) {
				
					self.playlist = playlist = PlaylistInstance
				
					new PlaylistModel({
						withUI : playlist,
						withApi : api,
						onload : function(PlaylistModelInstance) {
						
							playlistModel = self.playlistModel = PlaylistModelInstance
						
							playlistModel.updateInfo()
						
							playlistModel.updateButtons()
						
							callback && callback()
						}
					})
				}
			})
		},
		
		player : function(callback) {
		
			new Player({
				onload : function(PlayerInstance) {
				
					self.player = player = PlayerInstance
				
					new PlayerModel({
						withSettings : settings,
						withPlaylistModel : playlistModel,
						withUI : player,
						onload : function(PlayerModelInstance) {
						
							playerModel = self.playerModel = PlayerModelInstance
							
							callback && callback()
						}
					})
				}
			})
		}
	}
	
	if ( util.isMobile ) {
	
		initialiser = function() {
		
			console.log("Is Mobile.")
		}
	} else {
	
		initialiser = function(callback) {
		
			if ( util.browser.hasSupport.svg ) {
				util.addClass(document.body, 'svg')
			}
		
			// set self to the root Vibe object.
			self = this
		
			// initialiser is called in the context of 
			// the vibe object, and as such has access
			// to core instance properties.
			api = self.api
			settings = self.settings
		
			// give settings a reference to the root Vibe object.
			settings.super = self
		
			// make an instance of the settings assistant.
			settingsAssistant = new SettingsAssistant({
				withSettings : settings
			})
		
			// user interface element chain loading.
			// this will load the core interface
			// elements in sequence, finally calling
			// back to the Vibe instance.
			stage.playlist(function() {
			
				stage.collection(function() {
				
					stage.player(function() {
					
						if ( util.browser.hasSupport.cssTransitions ) {
						
							require(['model.animator'], function(Animator) {
							
								util.appendChildren(vibe, [
									player.node,
									collection.node,
									playlist.node
								])
								
								new Animator(player.node, 'fadeIn', 0.3)
							
								new Animator(collection.node, 'fadeIn', 0.3)
								
								new Animator(playlist.node, 'fadeIn', 0.3)
							})
						
						} else {
						
							util.appendChildren(vibe, [
								player.node,
								collection.node,
								playlist.node
							])
						}

						callback && callback()
					})
				})
			})
		}
	}
	
	//
	// alerts the interface elements to disconnection from the Api.
	//
	initialiser.alertInterfaceToDisconnection = function() {
	
		var elements = [player, collection, playlist]
		
		util.forEach(elements, function(element) {
		
			if ( typeof element.didDisconnectFromServer == 'function' ) {
			
				element.didDisconnectFromServer()
			}
		})
	}


	//
	// alerts the interface elements to reconnection from the Api
	//
	initialiser.alertInterfaceToReconnection = function() {
	
		var elements = [player, collection, playlist]
		
		util.forEach(elements, function(element) {
		
			if ( typeof element.didReconnectToServer == 'function' ) {
			
				element.didReconnectToServer()
			}
		})
	}

	return initialiser
})