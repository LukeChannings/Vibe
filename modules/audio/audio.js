define(['modules/audio/sm2/soundmanager2.js'],function(){

	// set the soundmanager2 flash directory.
	soundManager.url = 'modules/audio/sm2/swf';

	soundManager.wmode = 'transparent';

	soundManager.onready(function(){
	
		console.log("SoundManger loaded.");
	
		// when soundManager loads emit the 'audioReady' event.
		ee.emit('audioReady');
	
	});
	
	soundManager.ontimeout(function(status){
		
		console.error("SoundManager failed to load - " + status.message);
		
	});

	/**
	 * MMAudio
	 * @description Audio API for controlling playback. (SM2 wrapper.)
	 */
	function MMAudio(){
	
		// usual lark...
		var self = this;
		
		// array to contain current SMSound objects.
		var sounds = [];
		
		// stores the ID of the active SMSound.
		var current;
		
		/**
		 * add
		 * @description Creates a new SMSound object for the given URL.
		 * @param id (string) - ID of the track to play.
		 */
		this.add = function(id){
		
			var newSound = soundManager.createSound({
				id : id,
				url : settings.get('host') + '/stream/' + id
			});
			
			current = sounds.push(newSound) - 1;
		
		}

		this.addAndPlay = function(id){
		
			try{
			
				self.getCurrent().play();
				
			}
			catch(ex){
				
				// no current track.
				
			}
			
			self.add(id);
			
			self.getCurrent().play();
			
		}

		this.getCurrent = function(){
		
			if ( sounds[current] )
			{
				return sounds[current];
			}
			
			else return false;
		}
		
	}

	return MMAudio;

});