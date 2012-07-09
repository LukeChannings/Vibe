//
// An Api with which to access data from a Vibe Server.
// Provides methods for getting data and getting a stream url.
// @author Luke Channings
// @license MIT License
// @comment For implementation in Objective-C, see https://github.com/TheFuzzball/VibeApi-Objc
//
define(['util', 'lib/socket.io'], function(util) {

	// constructor function exposed as the module.
	// @param options {Object} object that defines the configuration of the instance.
	// @options host {string} the host ip or domain.
	// @options port {number} the server port.
	// @options autoconnect {boolean} automatically connect to the vibe server.
	// @options onconnect {function} (optional) called when the api is connected.
	// @options ondisconnect {function} (optional) called when the api disconnects.
	// @options onerror {function} (optional) called on connection error.
	// @return {bool} true for valid options, false for invalid options.
	var VibeApi = function(options) {
	
		if ( util.hasProperties(options, ['host', 'port']) ) {
		
			// state.
			this.connected = false
			this.disconnected = true
			this.connecting = false
		
			// options.
			this.host = options.host
			this.port = options.port
		
			// events.
			if ( typeof options.onconnect == 'function' ) {
				this.onconnect = options.onconnect
			}
			
			if ( typeof options.ondisconnect == 'function' ) {
				this.ondisconnect = options.ondisconnect
			}
			
			if ( typeof options.onerror == 'function' ) {
				this.onerror = options.onerror
			}
			
			if ( typeof options.onreconnect == 'function' ) {
				this.onreconnect = options.onreconnect
			}
		
			// autoconnect.
			if ( options.autoconnect ) {
				this.connect()
			}
		} else {
		
			throw new Error("VibeApi was instantiated without proper options.")
		}
	}
	
	// test that a Vibe Server exists on the given host.
	// @param url {string} location of the server.
	// @param callback {function} executed once the test is complete.
	var checkForVibeServer = function(url, callback) {
	
		var isIE8 = !!window.XDomainRequest,
			XHR = ( isIE8 ) ? new window.XDomainRequest() : new XMLHttpRequest(),
			hasCalledBack = false
		
		try {
			XHR.open('get', url + '/crossdomain.xml')
		} catch (ex) {
		
			console.log('caught.')
		
			if ( ! hasCalledBack ) {
			
				if ( /(null|undefined)/.test(url) ) {
					callback(false)
				} else {
					callback(true)
				}
				
				hasCalledBack = true
			}
			return
		}
		
		if ( isIE8 ) {
		
			XHR.onload = function() {
			
				if ( XHR.responseText.length > 0) {
					
					if ( ! hasCalledBack ) {
					
						callback(true)
						
						hasCalledBack = true
					}
				} else {
				
					if ( ! hasCalledBack ) {
					
						callback(false)
						
						hasCalledBack = true
					}
				}
			}
			
			XHR.onerror = function() {
			
				if ( ! hasCalledBack ) {
				
					callback(false)
					
					hasCalledBack = true
				}
			}
		} else {
		
			XHR.onreadystatechange = function() {
			
				if ( XHR.readyState == 4 ) {
				
					if ( XHR.status == 200 ) {
					
						if ( ! hasCalledBack ) {
						
							callback(true)
							
							hasCalledBack = true
						}
					} else {
					
						if ( ! hasCalledBack ) {
						
							callback(false)
							
							hasCalledBack = true
						}
					}
				}
			}
		}
		
		try {
		
			XHR.send()
		
		} catch (ex) {
		
			if ( ! hasCalledBack ) {
			
				callback(false)
				
				hasCalledBack = true
			}
			
			return
		}
	}
	
	// method for connecting to the Vibe Server.
	// when connected, the onconnect callback will
	// be executed. If connection fails then the
	// onerror callback will be executed.
	VibeApi.prototype.connect = function() {
	
		var self = this
	
		checkForVibeServer('http://' + self.host + ':' + self.port, function(serverExists) {
		
			if ( serverExists ) {
			
				var socket = self.socket = io.connect('http://' + self.host + ':' + self.port, {
						'transports' : ['websocket', 'flashsocket', 'jsonp-polling'],
						'try multiple transports' : false,
						'connect timeout' : 2000
					})
				
				self.connecting = true
				
				socket.on('connect', function() {
				
					self.connecting = self.disconnected = false
					self.connected = true
				
					self.onconnect && self.onconnect()
				})
				
				socket.on('disconnect', function() {
				
					self.connecting = self.connected = false
					self.disconnected = true
				
					self.ondisconnect && self.ondisconnect()
				})
				
				socket.on('reconnect', function() {
				
					self.connecting = self.disconnected = false
					self.connected = true
					
					self.onreconnect && self.onreconnect()
				})
				
				socket.on('connect_failed', function() {
				
					self.connecting = self.connected = false
					self.disconnected = true
				
					self.onerror && self.onerror()
				})
			} else {
			
				self.onerror && self.onerror()
			}
		})
	}
	
	// method for disconnecting from the Vibe Server.
	VibeApi.prototype.disconnect = function() {
	
		this.socket.disconnect()
		
		this.disconnected = true
		this.connected = this.connecting = false
	}
	
	/**
	 * getArtists
	 * @description Lists all artists within the collection.
	 * @param callback (function) - The function that will be sent the list of artists.
	 */
	VibeApi.prototype.getArtists = function(callback) {
	
		this.socket.emit('getArtists',function(err,artists) {
		
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
	VibeApi.prototype.getArtistsInGenre = function(genre,callback) {
	
		var genre = decodeURIComponent(genre)
	
		this.socket.emit('getArtistsInGenre', genre, function(err,artists) {
		
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
	VibeApi.prototype.getAlbums = function(callback) {
	
		this.socket.emit('getAlbums',function(err,albums) {
		
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
	VibeApi.prototype.getAlbumsByArtist = function(id,callback) {
	
		this.socket.emit('getAlbumsByArtist', id, function(err,albums) {
		
			util.forEach(albums, function(album) {
			
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
	VibeApi.prototype.getTracks = function(callback) {
	
		this.socket.emit('getTracks',function(err,tracks) {
		
			callback(tracks)
		})
	}
	
	VibeApi.prototype.getTracksInGenre = function(genre,callback) {
	
		genre = decodeURIComponent(genre)
	
		this.socket.emit('getTracksInGenre', genre, function(err,tracks) {
		
			util.forEach(tracks, function(track) {
			
				track.albumname = track.albumname || 'Unknown Album'
			
				track.artistname = track.artistname || 'Unknown Artist'
			
				track.trackname = track.trackname || 'Unknown Track'
			
				track.trackno = track.trackno || '0'
			})
			
			callback(tracks)
		})
	}
	
	VibeApi.prototype.getTracksByArtist = function(id,callback) {
	
		this.socket.emit('getTracksByArtist', id, function(err,tracks) {
		
			util.forEach(tracks, function(track){
			
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
	VibeApi.prototype.getTracksInAlbum = function(id,callback ){
	
		this.socket.emit('getTracksInAlbum', id, function(err, tracks) {
		
			util.map(tracks, function(track) {
			
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
	VibeApi.prototype.getTracksInAlbumShort = function(id,callback ){
	
		this.socket.emit('getTracksInAlbumShort', id, function(tracks) {
		
			util.map(tracks, function(track) {
			
				track.id = track.trackid
				
				track.name = track.trackname || "Unknown Track"
				
				track.trackno = track.trackno || null
			})
		
			callback(tracks)
		})
	}
	
	VibeApi.prototype.getTrack = function(id,callback) {
	
		this.socket.emit('getTrack', id, function(err,track) {
		
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
	VibeApi.prototype.getGenres = function(callback) {
	
		this.socket.emit('getGenres',function(err,genres) {
		
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
	VibeApi.prototype.search = function(query,callback) {
	
		// to be implemented.
		return 
	}
	
	/**
	 * getSubtype
	 * @description Returns type below the specified type in the set hierarchy.
	 */
	VibeApi.prototype.getSubtype = function(type) {
	
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
	VibeApi.prototype.getMethod = function(type, short) {
	
		var types = {
			'genre' : 'getArtistsInGenre',
			'artist' : 'getAlbumsByArtist',
			'album' : (short) ? 'getTracksInAlbumShort' : 'getTracksInAlbum'
		}
		
		if ( type in types ) return types[type]
		
		else return false
	}
	
	// export the module.
	return VibeApi
})