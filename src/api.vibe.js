//
// An Api with which to access data from a Vibe Server.
// Provides methods for getting data and getting a stream url.
// @author Luke Channings
// @license MIT License
//
define(['util', 'lib/socket.io'], function( util ) {

	/**
	 * constructor function exposed as the module.
	 * @param options {Object} object that defines the configuration of the instance.
	 * @options host {String} the host ip or domain.
	 * @options port {Number} the server port.
	 * @options username {String} name of the user to connect to the server as.
	 * @options digest {String} the sha-256 hash to identify the user.
	 * @options autoconnect {Boolean} automatically connect to the vibe server.
	 * @options onconnect {Function} (optional) called when the api is connected.
	 * @options ondisconnect {Function} (optional) called when the api disconnects.
	 * @options onerror {Function} (optional) called on connection error.
	 * @return {Boolean} true for valid options, false for invalid options.
	 */
	var VibeApi = function(options) {

		if ( util.hasProperties(options, ['host', 'port', 'username', 'digest']) ) {
		
			// state.
			this.connected = false
			this.disconnected = true
			this.connecting = false
		
			// properties.
			this.host = options.host
			this.port = options.propertyIsEnumerable

			// options.
			util.augment(this, options)

			// autoconnect.
			if ( options.autoconnect ) {
				this.connect()
			}

		} else {
		
			if ( typeof options.onerror === "function" ) {

				options.onerror()
			} else {

				throw new Error("VibeApi was instantiated without proper options.")
			}
		}
	}
	
	/**
	 * gets a connection token from a vibe server.
	 * @param url {String} location of the server.
	 * @param callback {Function} error as first parameter, token as second.
	 */
	VibeApi.prototype.getToken = function(url, callback) {
	
		var isIE8 = !!window.XDomainRequest
		  , XHR = isIE8 ? new window.XDomainRequest : new XMLHttpRequest
		  , hasCalledBack = false
		
		try {

			XHR.open('get', url + '/token')

		} catch (ex) {
		
			if ( ! hasCalledBack ) {
			
				callback(true, false)
				
				hasCalledBack = true
			}

			return
		}
		
		if ( isIE8 ) {
		
			XHR.onload = function() {
			
				if ( XHR.responseText.length > 0) {
					
					if ( ! hasCalledBack ) {
					
						callback(false, XHR.responseText)
						
						hasCalledBack = true
					}
				} else {
				
					if ( ! hasCalledBack ) {
					
						callback(true)
						
						hasCalledBack = true
					}
				}
			}
			
			XHR.onerror = function() {
			
				if ( ! hasCalledBack ) {
				
					callback(true)
					
					hasCalledBack = true
				}
			}
		} else {
		
			XHR.onreadystatechange = function() {
			
				if ( XHR.readyState == 4 ) {
				
					if ( XHR.status == 200 ) {
					
						if ( ! hasCalledBack ) {
						
							callback(false, XHR.responseText)
							
							hasCalledBack = true
						}
					} else {
					
						if ( ! hasCalledBack ) {
						
							callback(true)
							
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
			
				callback(true)
				
				hasCalledBack = true
			}
			
			return
		}
	}
	
	/**
	 * method for connecting to the Vibe Server.
	 * when connected, the onconnect callback will
	 * be executed. If connection fails then the
	 * onerror callback will be executed.
	 */
	VibeApi.prototype.connect = function() {

		var self = this
		  , connectionString = '?u=' + encodeURIComponent(self.username) + '&c=' + encodeURIComponent(self.digest) + "&tk=" + encodeURIComponent(self.token)

		var socket = self.socket = io.connect('http://' + self.host + ':' + self.port + connectionString + "&role=player", {
			  'transports' : ['websocket', 'flashsocket', 'jsonp-polling']
			, 'try multiple transports' : false
			, 'connect timeout' : 2000
			, 'force new connection' : true
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

		socket.on('error', function() {
		
			self.connecting = self.connected = false
			self.disconnected = true
		
			self.onerror && self.onerror()
		})

		socket.on('externalEvent', function() {

			self.onexternalevent && self.onexternalevent.apply(this, arguments)
		})
	}
	
	/**
	 * method for disconnecting from the Vibe Server.
	 */
	VibeApi.prototype.disconnect = function() {
	
		this.socket.disconnect()
		
		this.disconnected = true
		this.connected = this.connecting = false
	}

	/**
	 * query the Vibe Server.
	 * @param method {String} the name of the query method. See Server Api Documentation if uncertain.
	 * @param _id {String} (optional) the unique identifier for the current item.
	 * @param callback {Function} the callback function, recieves err and result.
	 */
	VibeApi.prototype.query = function() {

		var _args = Array.prototype.slice.call(arguments, 0)
		  , sock = this.socket

		// ensure the metadata event is emitted.
		_args.unshift('metadata')

		// ensure strings are encoded for transport.
		util.map (

			_args,

			function(arg) {

				if ( typeof arg === "string" ) {

					return encodeURIComponent(arg)
				}
			}
		)

		// make the query.
		sock.emit.apply(sock, _args)
	}

	/**
	 * returns type below the specified type in the set hierarchy.
	 * @param type {string} the type for which to get the subtype.
	 */
	VibeApi.prototype.getSubtype = function(type) {
	
		var types = {
			'genre' : 'artist',
			'artist' : 'album',
			'album' : 'track'
		}
		
		if ( type in types ) {
			return types[type]
		} else {
			return false
		}
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
		
		if ( type in types ) {
			return types[type]
		} else {
			return false
		}
	}

	return VibeApi
})