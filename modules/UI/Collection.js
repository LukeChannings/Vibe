/**
 * MusicMe Collection
 * @description Provides an interface for representing the MusicMe collection.
 */
define(['util','api/musicme','dep/EventEmitter'],function(util,Api,EventEmitter){

	// make an Api instance.
	var api = new Api(settings.get('host'),settings.get('port'));
	
	// constructor.
	function Collection(options){
	
		if ( options )
		{
			// allow an Id to be specified.
			var collectionId = options.id || "UICollection";
			
			// allow the top-level type to be specified.
			var rootType = this.rootType = options.rootType || "artists";
		}
	
		// collection element.
		var collection = this.collection = document.createElement('div');
		collection.setAttribute('id', collectionId);
	
		var treeList = this.list = new this.TreeList(this,rootType);
		
		// appendages.
		document.body.appendChild(collection);
	}
	
	// mixin EventEmitter.
	EventEmitter.augment(Collection.prototype);
	
	/**
	 * TreeList
	 * @description Creates a hierarchical view that represents the collection
	 */
	Collection.prototype.TreeList = function(self,rootType){

		this.self = self;

		// ordered list of collection elements. (e.g. artists, albums, tracks, genres, etc.)
		var list = this.list = document.createElement('ol');
		list.setAttribute('class', 'list');
	
		self.collection.appendChild(list);
	
		this.populate(null,rootType);
	
	}
	
	/**
	 * TreeList->populate
	 * @descripition Populates the TreeList with a specified or default type.
	 */
	Collection.prototype.TreeList.prototype.populate = function(e,type){
	
		var self = this;
	
		if ( type )
		{
		
			// clear the list.
			self.list.removeChildren();
		
			// add a click listener.
			util.addListener(self.list,'click',function(e){
			
				self.populate.call(self,e);
			
			});
		
			// populate top-level artists.
			if ( /artists?/i.test(type) )
			{
				api.getArtists(function(artists){
				
					var artists = self.makeItemsFromArray(artists,'artistid');
				
					artists.forEach(function(artist){
					
						self.list.appendChild(artist);
					
					});
				
				});
			}
			
			// populate top-level albums.
			else if ( /albums?/i.test(type) )
			{
				api.getAlbums(function(albums){
				
					var albums = self.makeItemsFromArray(albums,'albumid');
				
					albums.forEach(function(album){
					
						self.list.appendChild(album);
					
					});
				
				});
			}
			
			// populate top-level tracks.
			else if ( /tracks?/i.test(type) )
			{
				api.getTracks(function(tracks){
				
					var tracks = self.makeItemsFromArray(tracks,'trackid');
				
					tracks.forEach(function(track){
					
						self.list.appendChild(track);
					
					});
				
				});
			}
			
			// populate top-level genres.
			else if ( /genres?/i.test(type) )
			{
				api.getGenres(function(genres){
				
					genres.forEach(function(genre){
					
						genre.name = genre.genre;
					
						genre.id = encodeURIComponent(genre.genre);
					
					});
				
					var genres = self.makeItemsFromArray(genres,'genreid');
				
					genres.forEach(function(genre){
					
						self.list.appendChild(genre);
					
					});
				
				});
			}
		}
		else if ( e instanceof Event )
		{
			
			var target = e.target || e.srcElement;
			
			if ( target.getElementsByTagName('ol').length == 0 )
			{
				var list = document.createElement('ol');
				target.appendChild(list);
			}
			else
			{
				var list = target.getElementsByTagName('ol')[0];
				
			}
			
			// check if the target has been populated.
			if ( list.dataset.populated )
			{
				// toggle visibility.
				list.toggleClass('visible');
				
				console.log(list.dataset.populated);
				
				return;
			}
			
			// populate genre children with artists.
			if ( target.dataset.genreid )
			{
			
				var genre = decodeURIComponent(target.dataset.genreid);
				
				api.getArtistsInGenre(genre,function(artists){
				
					artists = self.makeItemsFromArray(artists,'artistid');
					
					artists.forEach(function(artist){
					
						list.appendChild(artist);
					
					});
					
					list.dataset.populated = true;
					
				});
			}
			
			// populate artist children with albums.
			else if ( target.dataset.artistid )
			{
				
				var id = target.dataset.artistid;
				
				api.getAlbumsByArtist(id,function(albums){
				
					albums = self.makeItemsFromArray(albums,'albumid');
				
					albums.forEach(function(album){
					
						list.appendChild(album);
					
					});
				
					list.dataset.populated = true;
				
				});
				
			}
			
			// populate album children with tracks.
			else if ( target.dataset.albumid )
			{
				
				var id = target.dataset.albumid;
				
				api.getTracksInAlbum(id,function(tracks){
				
					tracks = self.makeItemsFromArray(tracks,'trackid');
				
					tracks.forEach(function(track){
					
						list.appendChild(track);
					
					});
				
					list.dataset.populated = true;
				
				});
				
			}
			
			// handle track click.
			else if ( target.dataset.trackid )
			{
				// get the track id.
				var id = target.dataset.trackid;
				
				// collection emit addTrackToPlaylist event.
				self.self.emit('addTrackToPlaylist',id);
			}
			
			if ( list )
			{
				if ( list.className.length == 0 ) list.className = 'visible';
				else list.className += ' visible';
			}
		}
	}
	
	/**
	 * TreeList->makeItemsFromArray
	 * @description Creates an array of list items from an api result.
	 * @param items (array) - Api results.
	 */
	Collection.prototype.TreeList.prototype.makeItemsFromArray = function(items,prefix){
		
		var result = [];
		
		var self = this;
		
		items.forEach(function(item){
		
			var li = document.createElement('li');
			
			li.innerHTML = item.name;
			
			li.dataset[prefix || 'id'] = item.id;
			
			result.push(li);
		
		});
		
		return result;
		
	}
	
	
	
	return Collection;

});