/**
 * Vibe API
 * @description Vibe Application Programming Interface. Allows interfacing with a Vibe server.
 */
define(['dependencies/EventEmitter','util/methods','dependencies/socket.io'],function(EventEmitter, util){

	/**
	 * constructs an Api instance.
	 * @param config {object} contains properties and methods for configuring the instance.
	 * @param config.settings {object} instance of ModelSettings.
	 * @param config.onload {function} to be called when the Api is loaded.
	 * @param config.onerror {function} to be called if the Api has an error.
	 * @param config.onfirstrun {function} to be called if the model settings does not have a host or port.
	 */
	var Api = function(config) {
	
		var self = this,
			settings = this.settings = config.settings

		if ( util.implementsProtocol(config, ['onconnect', 'onerror', 'onfirstrun']) ) {
		
			this.connected = config.onconnect
			this.error = config.onerror
			this.firstrun = config.onfirstrun
		
			if ( typeof config.ondisconnect == 'function' ) this.disconnect = config.ondisconnect
		
			// connect.
			this.connect()	
		}
		
		else {
		
			throw new Error('The Api configuration does not implement the required methods.')
		}
	}
	
	/**
	 * connects to the vibe server.
	 */
	Api.prototype.connect = function() {
	
		var self = this
		this.connection = null
		
		// check for a missing host setting.
		if ( ! this.settings.get('host') || ! this.settings.get('port') ) {
		
			// call the first run event.
			this.firstrun()
			
			// prevent a connection attempt.
			return
		}
		
		// connect to the Vibe server.
		this.connection = io.connect('http://' + this.settings.get('host')  + ':' + this.settings.get('port'))

		// create an error dialogue on error.
		this.connection.on('error', function() {

			self.error()
		})
		
		this.connection.on('reconnect_failed', function() {
		
			self.error()
		})

		// emit ready event on connection.
		this.connection.on('connect', function() {

			self.connected()
		
			// Api is now ready.
			self.ready = true
		})
	
		// disconnect event.
		this.connection.on('disconnect', function() {
			
			if ( typeof self.disconnect == 'function' ) self.disconnect()
		})
	}

	/**
	 * getArtists
	 * @description Lists all artists within the collection.
	 * @param callback (function) - The function that will be sent the list of artists.
	 */
	Api.prototype.getArtists = function(callback) {
	
		this.connection.emit('getArtists',function(err,artists) {
		
			artists.sort(function(a,b) {
			
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
				if (a.name.toLowerCase() > b.name.toLowerCase())  return 1
				return 0
			})
		
			callback(artists)
		})
	}

	/**
	 * getArtistsInGenre
	 * @description Gets a list of artists that are in a genre.
	 * @param genre (string) - The name of genre to list artists for.
	 * @param callback (function) - Function to be sent the results.
	 */
	Api.prototype.getArtistsInGenre = function(genre,callback) {
	
		var genre = decodeURIComponent(genre)
	
		this.connection.emit('getArtistsInGenre', genre, function(err,artists) {
		
			artists.sort(function(a,b) {
			
				if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
				if (a.name.toLowerCase() > b.name.toLowerCase())  return 1
				return 0
			})
		
			callback(artists)
		})
	}

	/**
	 * getAlbums
	 * @description Lists all albums within the collection.
	 * @param callback (function) - The function that will be sent the list of albums.
	 */
	Api.prototype.getAlbums = function(callback) {
	
		this.connection.emit('getAlbums',function(err,albums) {
		
			if ( err ) throw err
		
			callback(albums)
		})
	}
	
	/**
	 * getAlbumsByArtist
	 * @description Gets a list of albums by a given artist.
	 * @param id (string) - The unique id of the artist.
	 * @param callback (function) - The function that will be sent the list of albums.
	 */
	Api.prototype.getAlbumsByArtist = function(id,callback) {
	
		this.connection.emit('getAlbumsByArtist', id, function(err,albums) {
		
			albums.forEach(function(album) {
			
				album.title = album.title || "Unknown Album."
			})
			
			albums.sort(function(a,b) {
			
				if (a.title.toLowerCase() < b.title.toLowerCase()) return -1
				
				if (a.title.toLowerCase() > b.title.toLowerCase())  return 1
				
				return 0
			})
		
			callback(albums)
		})
	}
	
	/**
	 * getTracks
	 * @description Lists all tracks within the collection.
	 * @param callback (function) - The function that will be sent the list of tracks.
	 */
	Api.prototype.getTracks = function(callback) {
	
		this.connection.emit('getTracks',function(err,tracks) {
		
			callback(tracks)
		})
	}
	
	Api.prototype.getTracksInGenre = function(genre,callback) {
	
		genre = decodeURIComponent(genre)
	
		this.connection.emit('getTracksInGenre', genre, function(err,tracks) {
		
			tracks.forEach(function(track) {
			
				track.albumname = track.albumname || 'Unknown Album'
			
				track.artistname = track.artistname || 'Unknown Artist'
			
				track.trackname = track.trackname || 'Unknown Track'
			
				track.trackno = track.trackno || '0'
			})
			
			callback(tracks)
		})
	}
	
	Api.prototype.getTracksByArtist = function(id,callback) {
	
		this.connection.emit('getTracksByArtist', id, function(err,tracks) {
		
			tracks.forEach(function(track){
			
				track.albumname = track.albumname || 'Unknown Album'
			
				track.artistname = track.artistname || 'Unknown Artist'
			
				track.trackname = track.trackname || 'Unknown Track'
			
				track.trackno = track.trackno || '0'
			})
		
			callback(tracks)
		})
	}
	
	/**
	 * getTracksInAlbum
	 * @description Get a list of tracks in a given album.
	 * @param id (string) - The unique identifier for the album.
	 * @param callback (function) - Function that will be sent the results.
	 */
	Api.prototype.getTracksInAlbum = function(id,callback ){
	
		this.connection.emit('getTracksInAlbum', id, function(err, tracks) {
		
			tracks.map(function(track) {
			
				track.albumname = track.albumname || 'Unknown Album'
					
				track.artistname = track.artistname || 'Unknown Artist'
					
				track.trackname = track.trackname || 'Unknown Track'
				
				track.trackno = track.trackno || '0'
			})
		
			callback(tracks)
		})
	}
	
	/**
	 * getTracksInAlbum
	 * @description Get a list of tracks in a given album.
	 * @param id (string) - The unique identifier for the album.
	 * @param callback (function) - Function that will be sent the results.
	 */
	Api.prototype.getTracksInAlbumShort = function(id,callback ){
	
		this.connection.emit('getTracksInAlbumShort', id, function(tracks) {
		
			tracks.map(function(track) {
			
				track.id = track.trackid
				
				track.name = track.trackname || "Unknown Track"
				
				track.trackno = track.trackno || null
			})
		
			callback(tracks)
		})
	}
	
	Api.prototype.getTrack = function(id,callback) {
	
		this.connection.emit('getTrack', id, function(err,track) {
		
			track.albumname = track.albumname || 'Unknown Album'
			
			track.artistname = track.artistname || 'Unknown Artist'
			
			track.trackname = track.trackname || 'Unknown Track'
		
			track.trackno = track.trackno || '0'
		
			callback(track)
		})
	}
	
	/**
	 * getGenres
	 * @description Lists all genres within the collection.
	 * @param callback (function) - The function that will be sent the list of genres.
	 */
	Api.prototype.getGenres = function(callback) {
	
		this.connection.emit('getGenres',function(err,genres) {
		
			genres.sort(function(a,b) {
			
				if (a.genre.toLowerCase() < b.genre.toLowerCase()) return -1
				
				if (a.genre.toLowerCase() > b.genre.toLowerCase())  return 1
				
				return 0
			})
		
			callback(genres)
		})
	}
	
	/**
	 * search
	 * @description Queries the collection for a specific result and returns complete TreeList branches.
	 * @param query (string) - The string to search for in the collection.
	 * @param callback (function) - The function to be sent the results.
	 */
	Api.prototype.search = function(query,callback) {
	
		// to be implemented.
		return false
	}
	
	/**
	 * getSubtype
	 * @description Returns type below the specified type in the set hierarchy.
	 */
	Api.prototype.getSubtype = function(type) {
	
		var types = {
			'genre' : 'artist',
			'artist' : 'album',
			'album' : 'track'
		}
		
		if ( type in types ) return types[type]
		
		else return false
	}

	/**
	 * returns the corresponding Api method for a given type.
	 * @param type {String} type of item we're fetching.
	 * @param short {Bool} short or long method.
	 */
	Api.prototype.getMethod = function(type, short) {
	
		var types = {
			'genre' : 'getArtistsInGenre',
			'artist' : 'getAlbumsByArtist',
			'album' : (short) ? 'getTracksInAlbumShort' : 'getTracksInAlbum'
		}
		
		if ( type in types ) return types[type]
		
		else return false
	}

	return Api
})