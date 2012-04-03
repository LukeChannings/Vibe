/**
 * Player
 * @description Provides functionality for queuing a playlist of tracks, plus basic control functionality.
 */
define(['dep/EventEmitter','dep/soundmanager2'],function(EventEmitter){

	soundManager.url = 'modules/dependencies';

	//soundManager.debugMode = false;

	var playlist = [];
	
	var playlistIndex = -1;

	function Player()
	{
	
		var self = this;
	
		this.playlist = playlist;
	
		soundManager.onready(function(){
		
			self.emit('ready');
		
		});
	}

	Player.prototype.getPlaylist = function()
	{
		return [playlist,playlistIndex];
	}

	Player.prototype.add = function(id)
	{
		var track = soundManager.createSound({
			'id' : 's' + id, // prefix 's' because ids should start with a letter.
			'url' : 'http://' + settings.get('host') + ':' + settings.get('port') + '/stream/' + id,
			'autoLoad' : true,
			'stream' : true,
			'bufferTime' : 3,
			'volume' : settings.get('volume') || 100
		});
		
		playlist.push(track);
	}

	Player.prototype.play = function(index)
	{
		var self = this;
		
		playlistIndex = ( index ) ? index : ( playlistIndex + 1 );
		
		(function readyStateChange(){
		
			if ( playlist[playlistIndex].readyState === 3 )
			{
				playlist[playlistIndex].play();
			}
			else if ( playlist[playlistIndex].readyState === 2 )
			{
				self.emit('error',"Cannot play index " + playlistIndex);
			}
			else
			{
				setTimeout(readyStateChange, 100);
			}
		
		})();
	
		
	}

	Player.prototype.pause = function(){}

	Player.prototype.stop = function(){}

	EventEmitter.augment(Player.prototype);
	
	return Player;

});