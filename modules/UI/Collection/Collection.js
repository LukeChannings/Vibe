/**
 * Collection
 * @description User Interface module to create a collection view.
 * @docs - https://github.com/TheFuzzball/MusicMe-WebApp/tree/master/modules/UI/Collection
 * @dependencies - util, musicme/api, UI/Widget/TreeList, EventEmitter.
 */
define([
	'require',
	'util',
	'dependencies/EventEmitter',
	'UI/Widget/TreeList/TreeList',
	'Model/DragAndDrop'
	],	function(require, util, EventEmitter, TreeList, DnD) {

	/**
	 * creates a new collection instance.
	 * @param options {object} options with which to configure the instance.
	 */
	var Collection = function(options) {

		// check for a valid options object.
		if ( !( typeof options == 'object' && options.withApi !== 'undefined') ) {
		
			this.emit('error', util.error('A valid options object was not passed to the UICollection constructor. Please consult the usage documentation at - https://github.com/TheFuzzball/MusicMe-WebApp/tree/master/modules/UI/Collection.','OPT_ERR'))
		}
		
		var self = this
		
		this.options = options
		
		util.registerStylesheet(require.toUrl('./Collection.css'), function() {

			// set the root type.
			var type = self.type = options.withRootType || 'artist'
			
			// set api.
			var api = self.api = options.withApi
	
			// create a collection node.
			var node = self.node = util.createElement({tag : 'div', id : 'UICollection'})
	
			// default the TreeList click timeout to 270ms.
			if ( ! options.clickTimeout ) options.clickTimeout = 270
	
			// check for an Api instance.
			if ( api ) {
			
				// check for the search bar option.
				if ( options.useSearch ) {
					
					require(['UI/Collection/CollectionSearchBar'], function(UICollectionSearchBar) {
					
						var searchBar = self.searchBar = new UICollectionSearchBar({
							'appendTo' : node,
							'apiInstance' : api
						})
					
						node.addClass('useSearch')
					
						searchBar.on('clear', function() {
						
							self.node.removeClass('noResults')
						
							self.populateWithType(type)
						
						})
					
						searchBar.on('noresults', function() {
						
							self.listContainer.removeChildren()
						
							self.node.addClass('noResults')
						
						})
					
						searchBar.on('results', function(result) {
						
							console.log(result)
						
						})
					
					})
					
				}
				
				// create the collection tree list.
				initList.call(self, type)
				
				// check for the info bar option.
				if ( options.useInfoBar ) initInfoBar.call(self)
				
			}
			
			// if there is no Api instance emit an error.
			else {
			
				self.emit('error', util.error('A valid Api instance was not passed to the UICollection constructor.','API_ERR'))	
			}
	
			// check for a drag and drop element.
			if ( options.dragAndDropElement instanceof Element ) {
			
				// if there is a drag and drop element set it as a property,
				self.dropTarget = options.dragAndDropElement
			
				// initialise DnD methods.
				initDragAndDrop.call(self)
			}
		
			// work around IE bug.
			setTimeout(function() {
			
				self.emit('loaded')
			
			}, 0)
		
		})
	}

	/**
	 * populates the top-level collection with genres, artists, albums or tracks.
	 * @param type {string} populate the collection with: genre, artist, album or track.
	 */
	Collection.prototype.populateWithType = function(type) {
	
		var self = this
	
		// throw an error on invalid type.
		if ( ! /(genre|album|artist|track)/i.test(type) ) throw util.error('Unrecognised type.')
		
		// get the top level data..
		this.api['get' + type[0].toUpperCase() + type.slice(1) + 's'](function(data) {
		
			// normalise type option.
			type = type.toLowerCase()
		
			// remap genre.
			if ( type == 'genre' ) {
			
				data.forEach(function(genre){
					
					genre.name = genre.genre
					
					genre.id = encodeURIComponent(genre.genre)
					
					delete genre.genre
					
				})
			}
			else if ( type == 'album' ) {
				
				data.forEach(function(album){
				
					album.setAttributes = {
						'data-albumart' : album.art_medium
					}
					
					util.cacheImage(album.art_medium)
					
				})
				
			}
		
			// remove existing TreeLists.
			self.listContainer.removeChildren()
			
			var options = {
				'appendTo' : self.listContainer,
				'isRootNode' : true,
				'isRootListener' : true,
				'customClass' : type,
				'setAttributes' : []
			}
			
			if ( self.dropTarget ) options.dragStartMethod = self.dragStart
			
			// create the tree list.
			var list = new TreeList(data, options, self.options.clickTimeout)
			
			if ( self.updateStatusBar ) self.updateStatusBar(type,data.length)
			
			// itemClicked
			// handles populating sub-items.
			list.on('itemClicked',function(item,isPopulated) {
			
				clickHandler.call(self,item,isPopulated)
			
			})
		
			// itemDoubleClicked
			// handles a double click event on a tree list item.
			list.on('itemDoubleClicked',function(item) {
			
				doubleClickHandler.call(self,item)
			
			})
		
		})
			
	}

	/**
	 * initDragAndDrop
	 * @description sets drag and drop methods dragstart, dragover, dragenter, dragleave and drop.
	 */
	var initDragAndDrop = function() {
	
		var self = this
	
		// cache the default album art.
		util.cacheImage(require.toUrl('./CollectionGenericAlbumArt.png'))
		util.cacheImage(require.toUrl('./CollectionGenericArtistArt.png'))
		
		// dragstart.
		// triggered when a draggable item is dragged.
		this.dragStart = function(target, e) {
		
			// set dnd mode.
			e.dataTransfer.dropEffect = 'copy'
		
			// get the collection type.
			var type = target.parentNode.className.match(/(genre|artist|album|track)/)[0]
			
			// get the id of the collection type.
			var id = target.getAttribute('data-id')
		
			// set a drag image.
			if ( e.dataTransfer.setDragImage ) {
				// Create a new ghost image.
				var DragImage = new Image()
				
				var url = ( type == 'artist' || type == 'genre' ) ?  require.toUrl('./CollectionGenericArtistArt.png') :
						  ( target.getAttribute('data-albumart') ) ? target.getAttribute('data-albumart') : 
						  ( target.parentNode.parentNode.getAttribute('data-albumart') ) ? target.parentNode.parentNode.getAttribute('data-albumart') :
						  require.toUrl('./CollectionGenericAlbumArt.png')
				
				url = ( url == 'null' ) ? require.toUrl('./CollectionGenericAlbumArt.png') : url
				
				// Set a generic album art.
				DragImage.src = url
				
				// Set the ghost image.
				e.dataTransfer.setDragImage(DragImage,-10,-10)
				
				return {
					'id' : id,
					'type' : type
				}
			}
		}
	
		DnD.droppable({
			node : this.dropTarget,
			zoneClass : 'draghighlight',
			zoneHighlightNode : this.dropTarget,
			dropZone : 'collection_playlist',
			drop : function(target, e, data) {
			
				if ( typeof data == 'object' ) self.emit('itemSelected', data)

				else {
				
					var data = []
	
					for ( var i = 0; i < e.dataTransfer.files.length; i++ ) {
					
						var reader = new FileReader()
					
						var type = e.dataTransfer.files[i].type
					
						reader.readAsDataURL(e.dataTransfer.files[i])
					
						reader.onloadend = function(e) {
						
							data.push({
								'type' : type,
								'data' : e.currentTarget.result.replace('data:' + type + 'base64,','')
							})
						}
					}
					
					self.emit('dataDrop', data)
				}
			}
		})
	}

	/**
	 * initialise the TreeList view.
	 * @param type (string) - Top-level type to initialise with. e.g. genre, artist, album or track.
	 */
	var initList = function() {
	
		var self = this
		
		this.listContainer = util.createElement({tag : 'div', customClass : 'listContainer',appendTo : this.node})
		
		this.populateWithType(self.type)
	
	}

	/**
	 * add an info bar below the TreeList to indicate the number of items there are in the collection. e.g. 300 Artists.
	 */
	var initInfoBar = function() {
	
		this.node.addClass('useInfo')
	
		var statusBar = this.statusBar = util.createElement({tag : 'div', children : [{tag : 'span'}],customClass : 'statusBar', appendTo : this.node})
	
		this.updateStatusBar = function(type,itemCount) {
		
			statusBar.getElementsByTagName('span')[0].innerHTML = itemCount + ' ' + type.charAt(0).toUpperCase() + type.slice(1)
			
			if ( itemCount > 1 ) statusBar.getElementsByTagName('span')[0].innerHTML += 's'
		
		}
	
	}

	/**
	 * handle item expansions within the TreeList or if the item is a track itemSelected will be emitted.
	 * @param item (HTMLLIElement) - the item clicked.
	 * @param isPopulated (bool) - boolean tells if data-populated is set on the item.
	 */
	var clickHandler = function(item,isPopulated){
	
		var self = this
	
		if ( ! isPopulated ) {
	
			// get the item id.
			var id = item.getAttribute('data-id')
		
			// get the parent class.
			var type = item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)
		
			// determine the method.
			type = ( type[0] ) ? type[0] : 'artist'
		
			var options = {
				'appendTo' : item,
				'customClass' : this.api.getSubtype(type),
				'setAttributes' : []
			}
		
			if ( options.customClass == 'track' ) options.isFinalNode = true
		
			if ( this.dropTarget ) {
			
				options.setAttributes.push(['draggable','true'])
				options.dragStartMethod = self.dragStart
			}
			
			if ( this.api.getMethod(type) ) {
			
				this.api[this.api.getMethod(type)](id,function(items) {
				
					if ( type == 'artist' ) {
					
						items.forEach(function(album) {
						
							album.title = album.title || "Unknown Album"
						
							album.setAttributes = { 'data-albumart' : album.art_medium }
							
							util.cacheImage(album.art_medium)
							
						})
					}
				
					new TreeList(items,options, self.options.clickTimeout)
				
				},true)
			}
			else
			{
				this.emit('itemSelected',{
					'type' : type,
					'id' : id
				})
			}
		
		}
	
	}
	
	/**
	 * handle a double click on a TreeList item.
	 * @param item (HTMLLIElement) - the item clicked.
	 */
	var doubleClickHandler = function(item) {
	
		this.emit('itemSelected',{
			'id' : item.getAttribute('data-id'),
			'type' : item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0]
		})
		
	}

	// event emitter mixin.
	EventEmitter.augment(Collection.prototype)

	return Collection

})