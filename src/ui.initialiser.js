/*
// User Interface Initialiser.
// responsible for fetching and initialising modules for either a 
// Desktop or Mobile interface and creating an instance of these
// modules in sequence.
*/
define(function(require) {
	
	var

	// dependencies.
	util = require('util'),
	Collection = require('ui.collection'),
	Playlist = require('ui.playlist'),
	PlaylistModel = require('model.playlist'),
	Player = require('ui.player'),
	PlayerModel = require('model.player'),
	ContextMenuModel = require('model.contextMenu'),
	ContextMenu = require('ui.widget.contextMenu'),
	KeyboardShortcutManager = require('model.keyboardShortcutManager'),
	
	// interfaces.
	collection = null,
	playlist = null,
	player = null,
	
	// data models.
	playlistModel = null,
	playerModel = null,
	contextMenuModel = new ContextMenuModel(),
	keyboardShortcutManager = null,
	keyboardShortcuts = require('settings.keyboardShortcuts'),
	
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

		// collection initialisation stage.
		collection : function (callback) {

			contextMenuModel.addContext(
				"ui.collection",
				[{
					title : "Add to playlist",
					
					callback : function(collectionItem, contextItem, collectionEvent, contextEvent) {
					
						console.log(collectionItem.innerHTML)

						playlistModel.add(
							collectionItem.parentNode.className.match(/(genre|artist|album|track)/)[0],
							collectionItem.getAttribute('data-id')
						)
					}
				},{
					title : "Play next",
					
					// only show this context item if this function returns true.
					optional : function() {
						return playerModel.isPlaying || playerModel.isPaused
					},
					
					callback : function(collectionItem, contextItem, collectionEvent, contextEvent) {

						var parent = collectionItem.parentNode
						  , id = collectionItem.getAttribute('data-id')
						  , type = parent.className.match(/(genre|artist|album|track)/)

						if ( type && type[0] ) {

							playlistModel.add(
								  type[0]
								, id
								, playlistModel.ui.playingNode.nextSibling
							)
						}
					}
				}]
			)

			new Collection({
				withApi : api,

				onitemselect : function(item, insertAfter) {
				
					playlistModel.add(item.type, item.id, insertAfter)
				},
				
				oncontextmenu : function(item, e) {
				
					ContextMenu(
						e,
						contextMenuModel.getContext('ui.collection')
					)
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
		
		// playlist initialisation stage.
		playlist : function(callback) {
		
			contextMenuModel.addContext(
				"ui.playlist",
				[{
					title : "Remove from Playlist",
					callback : function(target) {
					
						var row = target.parentNode.parentNode
					
						if ( util.hasClass(row, "selected") ) {
						
							playlistModel.remove(playlist.list.selectedNodes)
						} else {
						
							playlistModel.remove([row])
						}
					}
				}]
			)
		
			// configure the playlist.
			new Playlist({
				withControlBarButtons : [{
					isIcon : true,
					className : 'undo',
					titleText : "Undo",
					callback : function() {
						playlistModel.undo()
					}
				},{
					isIcon : true,
					className : 'redo',
					titleText : "Next",
					callback : function() {
						playlistModel.redo()
					} 
				},{
					isIcon : true,
					className : 'clear',
					titleText : "Clear",
					callback : function() {
						playlistModel.clear()
					}
				},{
					isIcon : true,
					className : 'settings',
					titleText : "Settings",
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
				oncontextmenu : function(item, e) {
				
					ContextMenu(
						e,
						contextMenuModel.getContext("ui.playlist")
					)
				},
				onload : function(PlaylistInstance) {
				
					self.playlist = playlist = PlaylistInstance
				
					playlist._super = self
				
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
		
		// player initialisation stage.
		player : function(callback) {

			new Player({
				onload : function(PlayerInstance) {
				
					self.player = player = PlayerInstance
				
					new PlayerModel({
						withSettings : settings,
						withPlaylistModel : playlistModel,
						withUI : player,
						api : api,
						onload : function(PlayerModelInstance) {
						
							playerModel = self.playerModel = PlayerModelInstance
							
							callback && callback()
						}
					})
				}
			})
		},

		// post-initialisation stage.
		postInitialisation : function(callback) {

			// instantiate the keyboard shortcut manager.
			keyboardShortcutManager = new KeyboardShortcutManager(self)

			// map the default keyboard shortcuts.
			util.mapObject(keyboardShortcuts, function(shortcut, handler) {

				keyboardShortcutManager.bind(shortcut, handler)
			})

			// attach the keyboard shortcut manager to the instance.
			self.keyboardShortcutManager = keyboardShortcutManager

			// continue initialisation.
			callback && callback()
		}
	}
	
	if ( util.isMobile ) {
	
		initialiser = function() {
		
			console.log("Is Mobile.")
		}
	} else {
	
		initialiser = function(callback) {
		
			// enable SVG for all browsers that support it.
			if ( util.browser.hasSupport.svg ) {
				util.addClass(document.body, 'svg')
			}
		
			// set self to the root Vibe object.
			self = this
		
			// attach the context menu instance to the vibe object.
			self.contextMenu = contextMenuModel
		
			// initialiser is called in the context of 
			// the vibe object, and as such has access
			// to core instance properties.
			api = self.api
			settings = self.settings
		
			// make an instance of the settings assistant.
			settingsAssistant = self.settingsAssistant
		
			// user interface element chain loading.
			// this will load the core interface
			// elements in sequence, finally calling
			// back to the Vibe instance.
			stage.playlist(function() {
			
				stage.collection(function() {
				
					stage.player(function() {
					
						stage.postInitialisation(function() {

							if ( util.browser.hasSupport.cssTransitions ) {
						
								require(['dom.animator'], function(Animator) {
								
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