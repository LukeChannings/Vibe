/**
 * MusicMe API
 * @description MusicMe Application Programming Interface. Allows interfacing with a MusicMe server.
 */
define(['dep/EventEmitter','dep/socket.io'],function(EventEmitter){

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

			require(['ModalDialogue/modalDialogue'],function(modal){
			
				modal.createDialogue({
					"title" : "Failed to connect.",
					"body" : "An attempt to connect to the MusicMe server at " + ( settings.get('host') || 'localhost' ) + ':' + ( settings.get('port') || 6232 ) + ' failed. Please check that the server is up and that you can access the domain and try again.',
					'errorDialogue' : true
				});
			
			});
				
			
		});

		// emit ready event on connection.
		this.connection.on('connect',function(){
		
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
		
			callback(artists);
		
		});
	
	}

	Api.prototype.getArtistsInGenre = function(genre,callback){
	
		this.connection.emit('getArtistsInGenre',genre,function(err,artists){
		
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
		
			callback(albums);
		
		});
	
	}
	
	Api.prototype.getAlbumsByArtist = function(id,callback){
	
		this.connection.emit('getAlbumsByArtist',id,function(err,albums){
		
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
	
	Api.prototype.getTracksInAlbum = function(id,callback){
	
		this.connection.emit('getTracksInAlbum',id,function(err,tracks){
		
			callback(tracks);
		
		});
	
	}
	
	/**
	 * getGenres
	 * @description Lists all genres within the collection.
	 * @param callback (function) - The function that will be sent the list of genres.
	 */
	Api.prototype.getGenres = function(callback){
	
		this.connection.emit('getGenres',function(err,genres){
		
			callback(genres);
		
		});
	
	}

	return Api;

});