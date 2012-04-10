/**
 * MusicMe Collection
 * @description Provides an interface for representing the MusicMe collection.
 */
define(['util','require','dependencies/EventEmitter','UI/Widget/TreeList/TreeList'],function(util, require, EventEmitter, TreeList){

	// include stylesheet.
	util.registerStylesheet(require.toUrl('./Collection.css'));
	
	// constructor.
	function Collection(options){
	
		// usual lark.
		var self = this;
	
		// make sure that options exists to prevent reference errors.
		var options = this.options = options || {};
	
		// check for a shared Api instance.
		if ( typeof options.sharedApi == 'object' )
		{
			var api = this.api = options.sharedApi;
			
			if ( api.ready )
			{
				apiReady();
			}
			else
			{
				// wait for the Api to become ready.
				api.once('ready',function(){
				
					apiReady.call(self);
				
				});
			}
			
			// handle an api error.
			api.once('error',function(){
			
				apiError.call(self);
			
			});
		}
		else
		{
			require(['api/musicme'],function(Api){
			
				// make an Api instance.
				var api = this.api = new Api(settings.get('host'),settings.get('port'));
			
				// wait for the Api to become ready.
				api.once('ready',function(){
				
					apiReady.call(self);
				
				});
			
				// handle an api error.
				api.once('error',function(){
				
					apiError.call(self);
				
				});
			
			});
			
		}
	
		// create the UICollection element.
		var element = this.element = document.createElement('div');
	
		// Check if there's a drop target specified.
		self.useDragAndDrop = ( typeof self.options.dropTarget !== 'undefined' &&  self.options.dropTarget instanceof Element ) ? 1 : 0;
	
		// create the list container element.
		var listContainer = this.listContainer = document.createElement('div');
	
		listContainer.addClass('listContainer');
	
		// set the Id.
		element.setAttribute('id','UICollection');
	
		// append the element.
		(options.appendTo || document.body).appendChild(element);
	
		// set loading class.
		element.addClass('loading');

		// wait for the API to connect.
		function apiReady(){
			
			var self = this;
			
			element.removeClass('loading');

			// determine the type of data to populate the collection with.
			var type = ( /(artist|album|genre|track)/i.test(options.rootType) ) ? options.rootType : 'artist';

			// check for search bar option.
			if ( options.useSearchBar )
			{
			
				element.addClass('usingSearch');
			
				var searchContainer = document.createElement('div');
				
				searchContainer.addClass('search');
				
				require(['UI/Widget/TextInput/TextInput'],function(TextInput){
				
					var input = new TextInput({
						appendTo : searchContainer,
						placeholder : 'Search the collection.'
					});
				
					input.element.addClass('search');
				
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
								api.search(query,function(results){
	
									// clear the current list.
									listContainer.removeChildren();
									
									// if there are results.
									if ( results.length > 0 )
									{
										
										// remove the noResults class if it's set.
										self.element.removeClass('noResults');
										
										var options = {
											appendTo : listContainer,
											isRootNode : true,
											customClass : 'artist',
											setAttributes : []
										}
										
										if ( self.useDragAndDrop )
										{
											options.setAttributes.push(['draggable','true']);
											options.dragStartMethod = self.dragStart;
										}
										
										// create a new TreeList based on the search results.
										var search = new TreeList(results,options);
										
										// itemClicked
										// handles populating sub-items.
										search.on('itemClicked',function(item, isPopulated){
										
											itemClicked.call(self,item,isPopulated);
										
										});
									
										// itemDoubleClicked
										// handles a double click event on a treelist item.
										search.on('itemDoubleClicked',function(item){
										
											itemDoubleClicked.call(self,item);
										
										});
									
									}
									
									// if there are no results.
									else
									{
										self.element.addClass('noResults');
									}
									
								});
							}
						
						},270);
					
					});
					
					// when the search input is cleared...
					input.on('clear',function(){
					
						self.element.removeClass('noResults');
					
						clearTimeout(window.timeout);
						
						window.timeout = undefined;
					
						// repopulate the collection with the default type.
						self.populate(type);
					
					});
				
				});
				
				element.appendChild(searchContainer);
			}
			
			element.appendChild(listContainer);
			
			self.populate(type);
			
		}
		
		// if the Api couldn't connect.
		function apiError(){
		
			// log the error.
			console.error("UICollection failed to create an Api instance. Cannot continue.");
		
			// emit the error.
			this.emit('error','ERR_CONNECT');
		
		}
	
		// Drag And Drop
		// If data from outside the browser is dropped the event 'dataDrop' is emitted
		// with the mime type of the data and the base64-encoded binary data.
		// If a collection item is dragged to the drop target the regular itemSelected event
		// is fired with the regular collectionItem object.
		if ( self.useDragAndDrop )
		{
		
			// cache the default album art.
			util.cacheImage(require.toUrl('./CollectionGenericAlbumArt.png'));
			util.cacheImage(require.toUrl('./CollectionGenericArtistArt.png'));
		
			// dragstart.
			// triggered when a draggable item is dragged.
			self.dragStart = function(e){
			
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
				
				// Create a new ghost image.
				var DragImage = new Image();
				
				if ( type == 'artist' )
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
		
			// dragover
			// triggered when the dragged item enters the drop target.
			util.addListener(options.dropTarget,'dragover',function(e){
				
				if (e.preventDefault) e.preventDefault();
				
				e.dataTransfer.effectAllowed = 'all';
				
				return false;
				
			});
			
			// dragenter
			// triggered when the item enters the drop target.
			util.addListener(options.dropTarget,'dragenter',function(e){
			
				options.dropTarget.addClass('draghighlight');
			
				return false;
			
			});
			
			// dragleave
			// triggered when the dragged item leaves the drop target.
			util.addListener(options.dropTarget,'dragleave',function(e){
				
				options.dropTarget.removeClass('draghighlight');
				
			});
			
			// drop
			// triggered when the dragged item is dropped within the drop target.
			util.addListener(options.dropTarget,'drop',function(e){
				
				var target = e.target || e.srcElement;
				
				options.dropTarget.removeClass('draghighlight');
				
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
	
	}
	
	function getMethodFor(type){
	
		var types = {
			'genre' : 'getArtistsInGenre',
			'artist' : 'getAlbumsByArtist',
			'album' : 'getTracksInAlbum'
		}
		
		if ( type in types ) return types[type];
		else return false;
	
	}
	
	function getSubtype(type){
	
		var types = {
			'genre' : 'artist',
			'artist' : 'album',
			'album' : 'track'
		}
	
		if ( type in types ) return types[type];
		else return false;
	
	}
	
	function itemClicked(item,isPopulated){
	
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
				'customClass' : getSubtype(type),
				'setAttributes' : []
			};
		
			if ( this.useDragAndDrop )
			{
				options.setAttributes.push(['draggable','true']);
				options.dragStartMethod = self.dragStart;
			}
			
			if ( getMethodFor(type) )
			{
				this.api[getMethodFor(type)](id,function(items){
				
					if ( type == 'artist' )
					{
						items.forEach(function(album){
						
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
	
	function itemDoubleClicked(item){
	
		this.emit('itemSelected',{
			'id' : item.getAttribute('data-id'),
			'type' : item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0]
		});
	
	}
	
	Collection.prototype.populate = function(method)
	{
		
		var self = this;
		
		// get the top level data..
		this.api['get' + method[0].toUpperCase() + method.slice(1) + 's'](function(data){
		
			// remap genre.
			if ( method == 'genre' )
			{
				data.forEach(function(genre){
					
					genre.name = genre.genre;
					
					genre.id = encodeURIComponent(genre.genre);
					
				});
			}
			else if ( method == 'album' )
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
				'customClass' : method,
				'setAttributes' : []
			}
			
			if ( self.useDragAndDrop )
			{
				options.setAttributes.push(['draggable','true']);
				options.dragStartMethod = self.dragStart;
			}
			
			// create the tree list.
			var list = new TreeList(data,options);
			
			// itemClicked
			// handles populating sub-items.
			list.on('itemClicked',function(item,isPopulated){
			
				itemClicked.call(self,item,isPopulated);
			
			});
		
			// itemDoubleClicked
			// handles a double click event on a treelist item.
			list.on('itemDoubleClicked',function(item){
			
				itemDoubleClicked.call(self,item);
			
			});
		
		});
		
	}
	
	// mixin EventEmitter.
	EventEmitter.augment(Collection.prototype);
	
	return Collection;

});