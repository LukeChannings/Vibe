/**
 * Collection
 * @description User Interface module to create a collection view.
 * @docs - https://github.com/TheFuzzball/MusicMe-WebApp/tree/master/modules/UI/Collection
 * @dependencies - util, musicme/api, UI/Widget/TreeList, EventEmitter.
 */
define(['require', 'util', 'dependencies/EventEmitter', 'UI/Widget/TreeList/TreeList'],function(require, util, EventEmitter, TreeList){

	// load stylesheet.
	util.registerStylesheet(require.toUrl('./Collection.css'));

	/**
	 * Collection (constructor)
	 * @description creates a new collection instance.
	 * @param config (object) - Object Literal options to initialise with.
	 */
	function Collection(options){

		// check for a valid options object.
		if ( !( typeof options == 'object' && options.withApi !== 'undefined') )
		{
			this.emit('error',util.error('A valid options object was not passed to the UICollection constructor. Please consult the usage documentation at - https://github.com/TheFuzzball/MusicMe-WebApp/tree/master/modules/UI/Collection.','OPT_ERR'));
		}
		
		var self = this;
		
		// check for a node to append the UICollection to.
		var appendTo = this.parentNode = ( options.appendTo instanceof Element ) ? options.appendTo : document.body;

		// set the root type.
		var type = this.type = options.withRootType || 'artist';
		
		// set api.
		var api = this.api = options.withApi;

		// create a collection node.
		var node = this.node = util.createElement({tag : 'div', id : 'UICollection'});

		// check for an Api instance.
		if ( api )
		{
			// check for the search bar option.
			if ( options.usingSearch ) initSearchBar.call(this);
			
			// create the collection tree list.
			initList.call(this,type);
			
			// check for the info bar option.
			if ( options.usingInfoBar ) initInfoBar.call(this);
			
			// append the UICollection to the set parent node.
			appendTo.appendChild(node);
		}
		
		// if there is no Api instance emit an error.
		else
		{
			this.emit('error',util.error('A valid Api instance was not passed to the UICollection constructor.','API_ERR'));
			
		}

		// check for a drag and drop element.
		if ( options.dragAndDropElement instanceof Element )
		{
		
			// if there is a drag and drop element set it as a property,
			this.dropTarget = options.dragAndDropElement;
		
			// initialise DnD methods.
			initDragAndDrop.call(this);
		}

	}

	/**
	 * initDragAndDrop
	 * @description sets drag and drop methods dragstart, dragover, dragenter, dragleave and drop.
	 */
	function initDragAndDrop(){
	
		var self = this;
	
		// cache the default album art.
		util.cacheImage(require.toUrl('./CollectionGenericAlbumArt.png'));
		util.cacheImage(require.toUrl('./CollectionGenericArtistArt.png'));
		
		// dragstart.
		// triggered when a draggable item is dragged.
		this.dragStart = function(e){
		
			// set dnd mode.
			e.dataTransfer.dropEffect = 'copy';
		
			// determine the target node.
			var target = e.target || e.srcElement;
		
			// get the collection type.
			var type = target.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0];
			
			// get the id of the collection type.
			var id = target.getAttribute('data-id');
		
			e.dataTransfer.setData('Text', JSON.stringify({
				'id' : id,
				'type' : type
			}));
			
			// set a drag image.
			if ( e.dataTransfer.setDragImage )
			{
				// Create a new ghost image.
				var DragImage = new Image();
				
				if ( type == 'artist' || type == 'genre' )
				{
					var url = require.toUrl('./CollectionGenericArtistArt.png');
				}
				else if ( target.getAttribute('data-albumart') )
				{
					var url = target.getAttribute('data-albumart');
				}
				else if ( target.parentNode.parentNode.getAttribute('data-albumart') )
				{
					var url = target.parentNode.parentNode.getAttribute('data-albumart');
				}
				else
				{
					var url = require.toUrl('./CollectionGenericAlbumArt.png');
				}
				
				// Set a generic album art.
				DragImage.src = url;
				
				// Set the ghost image.
				e.dataTransfer.setDragImage(DragImage,-10,-10);
			}
		}
	
		// dragover
		// triggered when the dragged item enters the drop target.
		util.addListener(this.dropTarget,'dragover',function(e){
			
			if (e.preventDefault) e.preventDefault();
			
			self.dropTarget.addClass('draghighlight');
			
			e.dataTransfer.effectAllowed = 'all';
			
			return false;
			
		});
		
		// dragenter
		// triggered when the item enters the drop target.
		util.addListener(this.dropTarget,'dragenter',function(e){
		
			return false;
		
		});
		
		// dragleave
		// triggered when the dragged item leaves the drop target.
		util.addListener(this.dropTarget,'dragleave',function(e){
			
			self.dropTarget.removeClass('draghighlight');
			
		});
	
		// drop
		// triggered when the dragged item is dropped within the drop target.
		util.addListener(this.dropTarget,'drop',function(e){
			
			var target = e.target || e.srcElement;
			
			self.dropTarget.removeClass('draghighlight');
			
			if ( e.dataTransfer.getData('Text') )
			{
			
				self.emit('itemSelected',JSON.parse(e.dataTransfer.getData('Text')));
			}
			else
			{
			
				var reader = new FileReader();
			
				for ( var i = 0; i < e.dataTransfer.files.length; i++ )
				{
				
					var type = e.dataTransfer.files[i].type;
				
					reader.readAsDataURL(e.dataTransfer.files[i]);
				
					reader.onloadend = function(e){
					
						var data = e.currentTarget.result.replace('data:' + type + ';base64,','');
					
						self.emit('dataDrop',type,data);
					
					}
					
				}
				
			}
			
			if ( e.preventDefault ) e.preventDefault();
			
		});
	
	}

	/**
	 * initList
	 * @description initialise the TreeList view.
	 * @param type (string) - Top-level type to initialise with. e.g. genre, artist, album or track.
	 */
	function initList(){
	
		var self = this;
		
		this.listContainer = util.createElement({tag : 'div',customClass : 'listContainer',appendTo : this.node});
		
		this.populateWithType(self.type);
	
	}

	/**
	 * initSearchBar
	 * @description adds a search bar above the TreeList for searching the collection.
	 */
	function initSearchBar(){
	
		var self = this;
	
		// create the search bar element.
		var element = this.searchBar = util.createElement({tag : 'div', customClass : 'search',appendTo : this.node});
	
		// set search lass on UICollection node.
		this.node.addClass('usingSearch');
	
		// fetch textinput widget.
		require(['UI/Widget/TextInput/TextInput'],function(TextInput){
		
			var input = new TextInput({
				appendTo : element,
				placeholder : 'Search the collection.',
				customClass : 'UIWidgetSearchInput search'
			});
		
			input.on('input',function(query,key){
				
				if ( typeof window.timeout !== 'undefined' )
				{
					clearTimeout(window.timeout);
					window.timeout = undefined;
				}
				
				window.timeout = setTimeout(function(){
					
					window.timeout = undefined;
					
					if ( key !== ' ' )
					{
						// query the api.
						self.api.search(query,function(results){

							// clear the current list.
							self.listContainer.removeChildren();
							
							// if there are results.
							if ( results.length > 0 )
							{
									
								// remove the noResults class if it's set.
								self.node.removeClass('noResults');
								
								var options = {
									appendTo : self.listContainer,
									isRootNode : true,
									customClass : 'artist',
									setAttributes : []
								}
								
								if ( self.dropTarget )
								{
									options.setAttributes.push(['draggable','true']);
									options.dragStartMethod = self.dragStart;
								}
								
								// create a new TreeList based on the search results.
								var search = new TreeList(results,options);
								
								// itemClicked
								// handles populating sub-items.
								search.on('itemClicked',function(item, isPopulated){
								
									clickHandler.call(self,item,isPopulated);
								
								});
							
								// itemDoubleClicked
								// handles a double click event on a treelist item.
								search.on('itemDoubleClicked',function(item){
								
									clickHandler.call(self,item);
								
								});
							
							}
							
							// if there are no results.
							else
							{
								self.node.addClass('noResults');
							}
							
						});
					}
				
				},270);
				
			});
		
			// when the search input is cleared...
			input.on('clear',function(){
			
				self.node.removeClass('noResults');
			
				clearTimeout(window.timeout);
				
				window.timeout = undefined;
			
				// repopulate the collection with the default type.
				self.populateWithType(self.type);
			
			});
		
		});
	
	}

	/**
	 * initInfoBar
	 * @description adds an info bar below the TreeList to indicate the number of items there are in the collection. e.g. 300 Artists.
	 */
	function initInfoBar(){
	
		this.node.addClass('usingInfo');
	
		var statusBar = this.statusBar = util.createElement({tag : 'div', children : [{tag : 'span'}],customClass : 'statusBar', appendTo : this.node});
	
		this.updateStatusBar = function(type,itemCount){
		
			statusBar.getElementsByTagName('span')[0].innerHTML = itemCount + ' ' + type.charAt(0).toUpperCase() + type.slice(1);
			
			if ( itemCount > 1 ) statusBar.getElementsByTagName('span')[0].innerHTML += 's';
		
		}
	
	}

	/**
	 * populateWithType
	 * @description populates the top-level collection with genres, artists, albums or tracks.
	 * @param type (string) - type to populate.
	 */
	Collection.prototype.populateWithType = function(type){
	
		var self = this;
		
		// get the top level data..
		this.api['get' + type[0].toUpperCase() + type.slice(1) + 's'](function(data){
		
			// remap genre.
			if ( type == 'genre' )
			{
				data.forEach(function(genre){
					
					genre.name = genre.genre;
					
					genre.id = encodeURIComponent(genre.genre);
					
					delete genre.genre;
					
				});
			}
			else if ( type == 'album' )
			{
				
				data.forEach(function(album){
				
					album.setAttributes = {
						'data-albumart' : album.art_medium
					};
					
					util.cacheImage(album.art_medium);
					
				});
				
			}
		
			// remove existing TreeLists.
			self.listContainer.removeChildren();
			
			var options = {
				'appendTo' : self.listContainer,
				'isRootNode' : true,
				'customClass' : type,
				'setAttributes' : []
			}
			
			if ( self.dropTarget )
			{
				options.setAttributes.push(['draggable','true']);
				options.dragStartMethod = self.dragStart;
			}
			
			// create the tree list.
			var list = new TreeList(data,options);
			
			if ( self.updateStatusBar ) self.updateStatusBar(type,data.length);
			
			// itemClicked
			// handles populating sub-items.
			list.on('itemClicked',function(item,isPopulated){
			
				clickHandler.call(self,item,isPopulated);
			
			});
		
			// itemDoubleClicked
			// handles a double click event on a tree list item.
			list.on('itemDoubleClicked',function(item){
			
				doubleClickHandler.call(self,item);
			
			});
		
		});
			
	}

	/**
	 * clickHandler
	 * @description handles item expansions within the TreeList or if the item is a track itemSelected will be emitted.
	 * @param item (HTMLLIElement) - the item clicked.
	 * @param isPopulated (bool) - boolean tells if data-populated is set on the item.
	 */
	function clickHandler(item,isPopulated){
	
		if ( ! isPopulated )
		{
			// get the item id.
			var id = item.getAttribute('data-id');
		
			// get the parent class.
			var type = item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/);
		
			// determine the method.
			type = ( type[0] ) ? type[0] : 'artist';
		
			var options = {
				'appendTo' : item,
				'customClass' : this.api.getSubtype(type),
				'setAttributes' : []
			};
		
			if ( this.dropTarget )
			{
				options.setAttributes.push(['draggable','true']);
				options.dragStartMethod = self.dragStart;
			}
			
			if ( this.api.getMethod(type) )
			{
				this.api[this.api.getMethod(type)](id,function(items){
				
					if ( type == 'artist' )
					{
						items.forEach(function(album){
						
							album.title = album.title || "Unknown Album";
						
							album.setAttributes = {
								'data-albumart' : album.art_medium
							};
							
							util.cacheImage(album.art_medium);
							
						});
					}
				
					new TreeList(items,options);
				
				},true);
			}
			else
			{
				this.emit('itemSelected',{
					'type' : type,
					'id' : id
				});
			}
		
		}
	
	}
	
	/**
	 * doubleClickHandler
	 * @description handles a double click on a TreeList item.
	 * @param item (HTMLLIElement) - the item clicked.
	 */
	function doubleClickHandler(item){
	
		this.emit('itemSelected',{
			'id' : item.getAttribute('data-id'),
			'type' : item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0]
		});
		
	}

	// event emitter mixin.
	EventEmitter.augment(Collection.prototype);

	return Collection;

});