/**
 * MusicMe Playlist
 * @description Provides a user interface for manipulating the playlist.
 */
define(['require','util'],function(require,util){

	util.registerStylesheet(require.toUrl('./Playlist.css'));

	function Playlist(appendTo, apiInstance)
	{
	
		// make a playlist element.
		var element = this.element = document.createElement('div'),
			self = this,
			api = true,
			list = this.list = document.createElement('ol'),
			header = this.header = document.createElement('div');
	
		// set the id.
		element.setAttribute('id','UIPlaylist');

		header.addClass('header');

		list.addClass('list');

		// make the list legend.
		var legend = constructPlaylistItem({
			'trackno' : "#",
			'trackname' : "Name",
			'albumname' : "Album",
			'artistname' : "Artist",
			'tracklength' : "Length"
		});

		legend.addClass('legend');

		element.appendChild(header);

		header.appendChild(legend);

		var api = this.api = apiInstance;
		
		if ( ! api ) this.emit('error');
	
		// append the list.
		element.appendChild(list);
	
		// append the element.
		(appendTo || document.body).appendChild(element);
	
	}

	/**
	 * constructPlaylistItem
	 * @description Generates a playlist item from a playlist object.
	 * 
	 */
	function constructPlaylistItem(item)
	{
		// create a playlist row.
		var row = document.createElement('li');
		
		var rowContainer = document.createElement('ol');
		
		var columns = {};
		
		for ( var i in item )
		{
			columns[i] = document.createElement('li');
			
			if ( i == 'tracklength' && typeof item[i] == 'number' )
			{
				item[i] = util.formatTime(item[i]);
			}
			
			columns[i].innerHTML = item[i];
			
			columns[i].addClass(i);
		}
		
		rowContainer.appendChildren([columns.trackno,columns.trackname,columns.artistname,columns.albumname,columns.tracklength]);
		
		row.appendChild(rowContainer);
		
		// return the row.
		return row;
	}

	/**
	 * getItems
	 * @description Fetches the items for the corresponding type and id.
	 * @param type (string) - The type of items to get.
	 * @param id (string) - The unique identifier for the type.
	 */
	function getItems(type,id,callback)
	{
		if ( type == 'genre' )
		{
			this.api.getTracksInGenre(id,function(tracks){
			
				callback(tracks);
			
			});
		}
		else if ( type == 'artist' )
		{
			this.api.getTracksByArtist(id,function(tracks){
			
				callback(tracks);
			
			});
		}
		else if ( type == 'album' )
		{
			this.api.getTracksInAlbum(id,function(tracks){
			
				callback(tracks);
			
			});
		}
		else if ( type == 'track' )
		{
			this.api.getTrack(id,function(tracks){
			
				callback(tracks);
			
			});
		}
	}
	
	/**
	 * add
	 * @description Adds a collection item to the playlist.
	 * @param type (string) - The type of item to add to the collection. (artist, album, etc.)
	 * @param id (string) - The unique identifier for the type.
	 */
	Playlist.prototype.add = function(type, id)
	{
		var self = this;
	
		getItems.call(this,type,id,function(items){
		
			items.forEach(function(item){
			
				var playlistItem = constructPlaylistItem.call(self, item);
				
				self.list.appendChild(playlistItem);
			
			});
		
		});
			
	}
	
	Playlist.prototype.clear = function()
	{
		this.list.removeChildren();
	}

	return Playlist;

});