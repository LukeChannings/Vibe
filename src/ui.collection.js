/**
 * User Interface module to create a collection view.
 * @docs - https://github.com/TheFuzzball/MusicMe-WebApp/tree/master/modules/UI/Collection
 * @dependencies - util, musicme/api, UI/Widget/TreeList, EventEmitter.
 */
define(function(require) {

	// dependencies.
	var util = require('util'),
		TreeList = require('ui.widget.treeList'),
		DnD = require('dom.dragAndDrop'),
		CollectionSearchBar = require('ui.collection.searchBar'),
		Dynamic = require('dom.dynamicNode')

	/**
	 * creates a new collection instance.
	 * @param options {object} options with which to configure the instance.
	 */
	var Collection = function(options) {

		var api, type, node, self = this

		if ( options.onload ) {
			this.onload = options.onload
		}
		
		if ( options.onitemselect ) {
			this.onitemselect = options.onitemselect
		}
		
		if ( options.ondatadrop ) {
			this.ondatadrop = options.ondatadrop
		}
		
		if ( options.onerror ) {
			this.onerror = options.onerror
		}

		if ( options.hasOwnProperty('withApi') ) {
		
			api = this.api = options.withApi
		} else {
		
			throw new Error("Collection options does not have property withApi.")
		}

		util.registerStylesheet('./stylesheets/ui.collection.css', function() {

			// the root type determines what the top-level list items will be.
			type = self.type = options.withRootType || 'artist'
			
			node = self.node = util.createElement({
				tag : 'div',
				id : 'UICollection'
			})
	
			// default the TreeList click timeout to 270ms.
			this.clickTimeout = ( options.clickTimeout ) ? options.clickTimeout : 270
	
			// check for an Api instance.
			var searchBar = self.searchBar = new CollectionSearchBar({
				appendTo : node,
				apiInstance : api,
				onclear : function() {
				
					util.removeClass(self.node, 'noResults')
				
					self.populateWithType(type)
				
				},
				onnoresult : function() {
				
					util.removeChildren(self.listContainer)
					
					util.addClass(self.node, 'noResults')
				},
				onresult : function(result) {
				
					console.log(result)
				}
			})
		
			// create the collection tree list.
			self.listContainer = util.createElement({
				tag : 'div',
				customClass : 'listContainer',
				appendTo : self.node
			})
			
			// check for a drag and drop element.
			if ( options.dragAndDropElement instanceof Element ) {
			
				// if there is a drag and drop element set it as a property,
				self.dropTarget = options.dragAndDropElement
			
				// initialise DnD methods.
				initDragAndDrop.call(self)
			}
			
			self.populateWithType(self.type)
			
			// check for the info bar option.
			initInfoBar.call(self)

			if ( typeof options.onload == 'function' ) {
				options.onload(self)
			}
			
			new Dynamic(node, function() {
			
				var windowHeight = window.innerHeight,
					distanceFromTop = 100,
					offsetBottom = 20,
					margin = 35 + 19,
					height = windowHeight - ( distanceFromTop + offsetBottom + margin )
				
				return {
					height : height
				}
			})
		})
	}

	/**
	 * populates the top-level collection with genres, artists, albums or tracks.
	 * @param type {string} populate the collection with: genre, artist, album or track.
	 */
	Collection.prototype.populateWithType = function(type) {
	
		var self = this
	
		// throw an error on invalid type.
		if ( ! /(genre|album|artist|track)/i.test(type) ) {
			throw new Error('Unrecognised type.')
		}
		
		// get the top level data..
		this.api['get' + type[0].toUpperCase() + type.slice(1) + 's'](function(data) {
		
			// normalise type option.
			type = type.toLowerCase()
		
			// remap genre.
			if ( type == 'genre' ) {
			
				util.forEach(data, function(genre){
					
					genre.name = genre.genre
					
					genre.id = encodeURIComponent(genre.genre)
					
					delete genre.genre
					
				})
			} else if ( type == 'album' ) {
				
				util.forEach(data, function(album){
				
					album.setAttributes = {
						'data-albumart' : album.art_medium
					}
					
					util.cacheImage(album.art_medium)
					
				})
			}
		
			// remove existing TreeLists.
			util.removeChildren(self.listContainer)
			
			var options = {
				appendTo : self.listContainer,
				isRootNode : true,
				isRootListener : true,
				customClass : type,
				setAttributes : []
			}
			
			if ( self.dropTarget ) {
				options.dragStart = self.dragStart
			}
			
			// itemClicked
			// handles populating sub-items.
			options.onclick = function(item,isPopulated) {
			
				clickHandler.call(self,item,isPopulated)
			}
			
			// itemDoubleClicked
			// handles a double click event on a tree list item.
			options.ondblclick = function(item) {
			
				doubleClickHandler.call(self, item)
			}
			
			// create the tree list.
			var list = new TreeList(data, options, self.clickTimeout)
			
			self.updateStatusBar(type, data.length)
		})
	}

	/**
	 * sets drag and drop methods dragstart, dragover, dragenter, dragleave and drop.
	 */
	var initDragAndDrop = function() {
	
		var self = this
	
		// cache the default album art.
		util.cacheImage('./images/ui.collection.genericAlbumArt.png')
		util.cacheImage('./images/ui.collection.genericArtistArt.png')
		
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
				var dragImage = new Image()
				
				var url = ( type == 'artist' || type == 'genre' ) 
						? './images/ui.collection.genericArtistArt.png'
						: ( target.getAttribute('data-albumart') )
						? target.getAttribute('data-albumart')
						: ( target.parentNode.parentNode.getAttribute('data-albumart') )
						? target.parentNode.parentNode.getAttribute('data-albumart')
						: './images/ui.collection.genericAlbumArt.png'
				
				url = ( url == 'null' ) ? './images/ui.collection.genericAlbumArt.png' : url
				
				// Set a generic album art.
				dragImage.src = url
				
				// Set the ghost image.
				e.dataTransfer.setDragImage(dragImage,-10,-10)
			}
			
			return {
				'id' : id,
				'type' : type
			}
		}

		DnD.droppable({
			node : this.dropTarget,
			zoneClass : 'draghighlight',
			zoneHighlightNode : this.dropTarget,
			dropZone : 'collection_playlist',
			drop : function(target, e, data) {
			
				if ( typeof data == 'object' ) {
				
					self.onitemselect(data)
				
				} else {
				
					var data = []
	
					if ( e.dataTransfer.files ) {
						for ( var i = 0; i < e.dataTransfer.files.length; i += 1 ) {
						
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
					}
					
					self.ondatadrop(data)
				}
			}
		})
	}

	/**
	 * add an info bar below the TreeList to indicate the number of items there are in the collection. e.g. 300 Artists.
	 */
	var initInfoBar = function() {
	
		util.addClass(this.node, 'useInfo')
	
		var statusBar = this.statusBar = util.createElement({
			tag : 'div',
			children : [{
				tag : 'span'
			}],
			customClass : 'statusBar',
			appendTo : this.node
		})
	
		util.disableUserSelect(statusBar)
	
		this.updateStatusBar = function(type,itemCount) {
		
			statusBar.getElementsByTagName('span')[0].innerHTML = itemCount + ' ' + type.charAt(0).toUpperCase() + type.slice(1)
			
			if ( itemCount > 1 ) {
				statusBar.getElementsByTagName('span')[0].innerHTML += 's'
			}
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
		
			if ( options.customClass == 'track' ) {
				options.isFinalNode = true
			}
		
			if ( this.dropTarget ) {
			
				options.setAttributes.push(['draggable','true'])
				options.dragStartMethod = self.dragStart
			}
			
			if ( this.api.getMethod(type, true) ) {
			
				this.api[this.api.getMethod(type, true)](id,function(items) {
				
					if ( type == 'artist' ) {
					
						util.forEach(items, function(album) {
						
							album.title = album.title || "Unknown Album"
						
							album.setAttributes = { 'data-albumart' : album.art_medium }
							
							util.cacheImage(album.art_medium)
						})
					}
				
					new TreeList(items,options, self.clickTimeout)
				
				},true)
			} else {
				this.onitemselected({
					type : type,
					id : id
				})
			}
		}
	}
	
	/**
	 * handle a double click on a TreeList item.
	 * @param item (HTMLLIElement) - the item clicked.
	 */
	var doubleClickHandler = function(item) {
	
		this.onitemselect({
			id : item.getAttribute('data-id'),
			type : item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0]
		})
	}

	return Collection
})