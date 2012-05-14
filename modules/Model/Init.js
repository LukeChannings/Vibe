/**
 * ModelInit
 * @description Defines initialisation routines for the User Interface. A delegee for the controller.
 */
define(['util'],function(util){

	var ModelInit = {}

	ModelInit.desktop = function() {
	
		var self = this
	
		// get the UI modules.
		require(['UI/Collection/Collection','UI/Playlist/Playlist','Model/Playlist','Model/Player'], function(UICollection, UIPlaylist, ModelPlaylist, Player) {
		
			var playlist = self.playlist = new UIPlaylist({
				appendTo : self.rootNode,
				useControlBar : true,
				useInfoBar : true,
				useControlBar : [{
					'isIcon' : true,
					'customClass' : 'undo',
					'callback' : function() {
						modelPlaylist.undo()
					}
				},{
					'isIcon' : true,
					'customClass' : 'redo',
					'callback' : function() {
						modelPlaylist.redo()
					}
				},{
					'isIcon' : true,
					'customClass' : 'clear',
					'callback' : function() {
						modelPlaylist.clear()
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
			
			var modelPlaylist = self.modelPlaylist = new ModelPlaylist({ withUI : playlist, withApi : self.api })
			
			var player = self.player = new Player({ 'withSettings' : self.settings, 'withModelPlaylist' : modelPlaylist })
			
			// keep the model sane.
			modelPlaylist.model.prune()
			
			playlist.on('playItem',function(id, index, node) {
				
				modelPlaylist.setIndex(index, node)
				
				player.addSound(id , true)
			
			})
			
			playlist.on('itemSelected',function(item) {
			
				console.log(item)
			
			})
			
			var collection = self.collection = new UICollection({
				withApi : self.api,
				appendTo : self.rootNode,
				useSearch : true,
				useInfoBar : true,
				dragAndDropElement : playlist.node,
				withRootType : self.settings.get('collectionRootType') || 'genre'
			})
		
			collection.on('itemSelected',function(item){
			
				modelPlaylist.add(item.type, item.id)
				
			})
			
			collection.on('dataDrop', function(data) {
			
				require(['UI/ModalDialogue/ModalDialogue'], function(dialogue) {
					
					var elements = []
					
					data.forEach(function(image) {
					
						var image = document.createElement('img')
							
						image.src = 'data:' + image.type + ';base64,' + image.data
					
						console.log(image)
					
						elements.push(image)
					
					})
					
					console.log(elements)
					
					var MDD = {
						'title' : 'Zar\'s Image!',
						'body' : elements,
						'buttons' : {'close' : true}
					}
				
					dialogue.createSingle(MDD)
				
				})
				
			})
			
		
		})
	
	}
	
	ModelInit.mobile = function() {
	
		document.body.innerHTML += "<h1 style='text-align: center'>Mobile UI is not yet implemented.</h1>"
	
	}

	return ModelInit

})