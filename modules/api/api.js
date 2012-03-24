define(['modules/api/socket.io'],function(){

	/**
	 * API
	 * @description MusicMe API.
	 * @param host (string) - The host/domain of the MusicMe server.
	 * @param port (int) - The port of the MusicMe server. (optional, defaults to 6232.)
	 * @param user (string) - The username to authenticate with. (optional, defaults to no auth.)
	 * @param pass (string) - The password to authenticate with. (optional, defaults to no auth.)
	 */
	var API = function(host,port,user,pass){
	
		var self = this;
	
		// check for host and port.
		if ( host )
		{
		
			// set a default port as a fallback.
			var port = ( ! port ) ? 6232 : port;
			
			// connect to MusicMe.
			this.sio = io.connect('http://' + host + ':' + port);
			
			this.sock = this.sio.socket;
			
			this.connected = "NO";

			// check if we're connected every 100 miliseconds.
			(function testConnection(timeoutCount){
			
				// check that the connection hasn't taken more than 20 seconds.
				if ( timeoutCount >= 200 )
				{
					if ( ee ) ee.emit('API_CONNECTION_ERROR');
					self.connected = "NO";
				}
				else
				{
				
					if ( self.sock.connected )
					{
						if ( ee ) ee.emit('API_CONNECTED');
					}
					else if ( timeoutCount >= 1 && ! self.sock.connecting && ! self.sock.connected )
					{
						console.log("Connection failed.");
						if ( ee ) ee.emit('API_CONNECTION_ERROR');
					}
					else
					{
						setTimeout(function(){
				
							testConnection(++timeoutCount);
					
						}, 100);
				 	}
				}
			
			})(0);
			
		}
		
		// if there is nothing to connect to.
		else {
			
			// log an error.
			console.error("No host specified for API connection.");
			
			// invalidate the instance.
			return false;
			
		}
	
	}
	
	API.prototype.getArtists = function(callback){
	
		this.sio.emit('getArtists',callback);
	
	}
	
	API.prototype.getAlbums = function(callback){
	
		this.sio.emit('getAlbums',callback);
	
	}
	
	API.prototype.getTracks = function(callback){
		
		this.sio.emit('getTracks',callback);
		
	}
	
	API.prototype.getArtistAlbums = function(){}
	
	return API;

});