/**
 * MusicMe API
 * @description MusicMe Application Programming Interface. Allows interfacing with a MusicMe server.
 */
define(['dependencies/EventEmitter','dependencies/socket.io'],function(EventEmitter){

	// constructor.
	function Api(host,port)
	{
	
		var self = this;

		// set ready default.
		this.ready = false;

		// connect to the MusicMe server.
		this.connection = io.connect( 'http://' + ( host || 'localhost' ) + ':' + ( port || 6232 ) );

		// create an error dialogue on error.
		this.connection.on('error',function(){

			self.emit('error');

		});

		// emit ready event on connection.
		this.connection.on('connect',function(){
		
			self.ready = true;
		
			self.emit('ready');
		
			// Api is now ready.
			self.ready = true;
		
		});

	}
	
	EventEmitter.augment(Api.prototype);

	/**
	 * getArtists
	 * @description Lists all artists within the collection.
	 * @param callback (function) - The function that will be sent the list of artists.
	 */
	Api.prototype.getArtists = function(callback){
	
		this.connection.emit('getArtists',function(err,artists){
		
			test = artists;
		
			artists.sort(function(a,b){
			
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				if (a.name.toLowerCase() > b.name.toLowerCase())  return 1;
				return 0;
			
			});
		
			callback(artists);
		
		});
	
	}

	/**
	 * getArtistsInGenre
	 * @description Gets a list of artists that are in a genre.
	 * @param genre (string) - The name of genre to list artists for.
	 * @param callback (function) - Function to be sent the results.
	 */
	Api.prototype.getArtistsInGenre = function(genre,callback){
	
		var genre = decodeURIComponent(genre);
	
		this.connection.emit('getArtistsInGenre',genre,function(err,artists){
		
			artists.sort(function(a,b){
			
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				if (a.name.toLowerCase() > b.name.toLowerCase())  return 1;
				return 0;
			
			});
		
			callback(artists);
		
		});
	
	}

	/**
	 * getAlbums
	 * @description Lists all albums within the collection.
	 * @param callback (function) - The function that will be sent the list of albums.
	 */
	Api.prototype.getAlbums = function(callback){
	
		this.connection.emit('getAlbums',function(err,albums){
		
			albums.sort(function(a,b){
			
				if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
				if (a.title.toLowerCase()> b.title.toLowerCase())  return 1;
				return 0;
			
			});
		
			callback(albums);
		
		});
	
	}
	
	/**
	 * getAlbumsByArtist
	 * @description Gets a list of albums by a given artist.
	 * @param id (string) - The unique id of the artist.
	 * @param callback (function) - The function that will be sent the list of albums.
	 */
	Api.prototype.getAlbumsByArtist = function(id,callback){
	
		this.connection.emit('getAlbumsByArtist',id,function(err,albums){
		
			albums.forEach(function(album){
			
				album.title = album.title || "Unknown Album.";
			
			});
			
			albums.sort(function(a,b){
			
				if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
				if (a.title.toLowerCase() > b.title.toLowerCase())  return 1;
				return 0;
			
			});
		
			callback(albums);
		
		});
	
	}
	
	/**
	 * getTracks
	 * @description Lists all tracks within the collection.
	 * @param callback (function) - The function that will be sent the list of tracks.
	 */
	Api.prototype.getTracks = function(callback){
	
		this.connection.emit('getTracks',function(err,tracks){
		
			callback(tracks);
		
		});
	
	}
	
	Api.prototype.getTracksInGenre = function(genre,callback){
	
		genre = decodeURIComponent(genre);
	
		this.connection.emit('getTracksInGenre',genre,function(err,tracks){
		
			tracks.forEach(function(track){
			
				track.albumname = track.albumname || 'Unknown Album';
			
				track.artistname = track.artistname || 'Unknown Artist';
			
				track.trackname = track.trackname || 'Unknown Track';
			
			});
		
		});
	
	}
	
	Api.prototype.getTracksByArtist = function(id,callback){
	
		this.connection.emit('getTracksByArtist',id,function(err,tracks){
		
			tracks.forEach(function(track){
			
				track.albumname = track.albumname || 'Unknown Album';
			
				track.artistname = track.artistname || 'Unknown Artist';
			
				track.trackname = track.trackname || 'Unknown Track';
			
			});
		
			callback(tracks);
		
		});
	
	}
	
	/**
	 * getTracksInAlbum
	 * @description Get a list of tracks in a given album.
	 * @param id (string) - The unique identifier for the album.
	 * @param callback (function) - Function that will be sent the results.
	 */
	Api.prototype.getTracksInAlbum = function(id,callback,minimal){
	
		this.connection.emit('getTracksInAlbum',id,minimal,function(err,tracks){
		
			tracks.forEach(function(track){
			
				track.albumname = track.albumname || 'Unknown Album';
			
				track.artistname = track.artistname || 'Unknown Artist';
			
				track.trackname = track.trackname || 'Unknown Track';
			
			});
		
			callback(tracks);
		
		});
	
	}
	
	Api.prototype.getTrack = function(id,callback){
	
		this.connection.emit('getTrack',id,function(err,track){
		
			track.albumname = track.albumname || 'Unknown Album';
			
			track.artistname = track.artistname || 'Unknown Artist';
			
			track.trackname = track.trackname || 'Unknown Track';
		
			callback(track);	
		
		});
	
	}
	
	/**
	 * getGenres
	 * @description Lists all genres within the collection.
	 * @param callback (function) - The function that will be sent the list of genres.
	 */
	Api.prototype.getGenres = function(callback){
	
		this.connection.emit('getGenres',function(err,genres){
		
			genres.sort(function(a,b){
			
				if (a.genre.toLowerCase() < b.genre.toLowerCase()) return -1;
				if (a.genre.toLowerCase() > b.genre.toLowerCase())  return 1;
				return 0;
			
			});
		
			callback(genres);
		
		});
	
	}
	
	/**
	 * search
	 * @description Queries the collection for a specific result and returns complete TreeList branches.
	 * @param query (string) - The string to search for in the collection.
	 * @param callback (function) - The function to be sent the results.
	 */
	Api.prototype.search = function(query,callback){
	
		this.connection.emit('search',query,function(result){
		
			var items = [];
			
			result.forEach(function(item){
			
				items.push({
					name : item.artistname,
					id : item.artistid,
					setAttributes : {customClass : 'expanded',draggable : 'true'},
					children : [{
						name : item.albumname,
						id : item.albumid,
						setAttributes : {customClass : 'expanded',draggable : 'true'},
						children : [{
							name : item.trackname,
							id : item.trackid,
							setAttributes : {draggable : 'true'},
						}],
						childrenOptions : {
							customClass : 'track'
						}
					}],
					childrenOptions : {
						customClass : 'album'
					}
				});
			
			});
		
			callback(items);
		
		});
	
	}
	
	/**
	 * getSubtype
	 * @description Returns type below the specified type in the set hierarchy.
	 */
	Api.prototype.getSubtype = function(type){
	
		var types = {
			'genre' : 'artist',
			'artist' : 'album',
			'album' : 'track'
		}
		
		if ( type in types ) return types[type];
		else return false;
	
	}

	/**
	 * getMethod
	 * @description returns the corresponding Api method for a given type.
	 */
	Api.prototype.getMethod = function(type){
	
		var types = {
			'genre' : 'getArtistsInGenre',
			'artist' : 'getAlbumsByArtist',
			'album' : 'getTracksInAlbum'
		}
		
		if ( type in types ) return types[type];
		else return false;
	
	}

	return Api;

});