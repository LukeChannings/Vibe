/**
 * Player
 * @description Provides functionality for queuing a playlist of tracks, plus basic control functionality.
 */
define(['dep/EventEmitter','dep/soundmanager2'],function(EventEmitter){

	soundManager.url = 'modules/dependencies';

	soundManager.debugMode = false;

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
			'url' : 'http://' + settings.get('host') + ':' + ( settings.get('port') || 6232 ) + '/stream/' + id,
			'type' : 'audio/mpeg',
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
		
		playlistIndex = ( index ) ? index : ( playlistIndex == -1 ) ? 0 : playlistIndex;
		
		if (playlist[playlistIndex]  )
		{
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
		else
		{
			console.error("No SMSound at current index.");
		}
		
	}

	Player.prototype.pause = function()
	{
		if ( playlist[playlistIndex] )
		{
			playlist[playlistIndex].pause();
		}
		else
		{
			console.error("No SMSound at current index.");
		}
	}

	Player.prototype.stop = function(){
	
		if ( playlist[playlistIndex] )
		{
			playlist[playlistIndex].stop();
		}
		else
		{
			console.error("No SMSound at current index.");
		}
	}

	Player.prototype.next = function()
	{
		this.stop();
		
		playlistIndex++;
		
		this.play(playlistIndex);
	}

	Player.prototype.prev = function()
	{
		this.stop();
		
		playlistIndex - 2;
		
		this.play(playlistIndex);
	}

	EventEmitter.augment(Player.prototype);
	
	return Player;

});