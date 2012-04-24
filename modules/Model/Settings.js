define(function(){

	/**
	 * Settings
	 * @description MusicMe settings object. (Keeps persistency.)
	 */
	function Settings(){
	
		var self = this;
	
		// settings object.
		var settings = this.settings = {};
	
		/**
		 * readSettings
		 * @description reads the contents of settings.json into the settings object.
		 */
		(function readSettings(){
		
			if ( localStorage.musicMeSettings )
			{
				settings = JSON.parse(localStorage.musicMeSettings);
				
			}
		
		})();
		
		/**
		 * writeSettings
		 * @description write the settings object back into settings.json.
		 */
		function writeSettings(key){
		
			// convert the object into a string and overwrite the persistent storage.
			localStorage.musicMeSettings = JSON.stringify(settings);
		
		}
	
		/**
		 * set
		 * @description set a setting.
		 * @param key (string) - the setting key.
		 * @param value (string) - the value for the setting.
		 */
		this.set = function(key,value){
		
			// set a setting.
			settings[key] = value;
		
			// commit the setting.
			writeSettings(key);
		
		}
		
		/**
		 * unset
		 * @description Delete a setting.
		 * @param key (string) - the key to unset.
		 */
		this.unset = function(key){
		
			// make sure there is a key.
			if ( settings[key] )
			{
				// delete the key.
				delete settings[key];
			
				// write the change to settings.json.
				writeSettings();
			}
			else
			{
				// if there is no key then log it.
				console.error("Unable to unset '" + key + "' as it does not exist.");
			}
		}
		
		/**
		 * get
		 * @description Get a setting.
		 * @param key (string) - the name of the setting.
		 */
		this.get = function(key){
		
			// return the value.
			return settings[key];
		
		}
		
		// alias.
		this.clear = function(){
			
			localStorage.clear();
		}
	}
	
	return Settings;

});