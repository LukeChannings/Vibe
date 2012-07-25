/**
 * Vibe settings.
 */
define(['util', 'model.persistence'], function( util, Persistence ) {

	var Settings = function(done) {
	
		var self = this,
	
		// settings object.
		settings = this.settings = {},
	
		// persistant storage instance.
		persistence = new Persistence('vibeSettings'),
			
		// reference to this.
		self = this
	
		/**
		 * reads the contents of settings.json into the settings object.
		 */
		;(function readSettings() {
		
			settings = persistence.load() || {}
		
		})()
		
		/**
		 * write the settings object back into settings.json.
		 */
		var writeSettings = function() {
		
			// convert the object into a string and overwrite the persistent storage.
			persistence.save(settings)
		}
	
		/**
		 * set a setting.
		 * @param key (string) - the setting key.
		 * @param value (string) - the value for the setting.
		 */
		this.set = function(key,value) {
		
			// set a setting.
			settings[key] = value
		
			// commit the setting.
			writeSettings()
		}
		
		/**
		 * delete a setting.
		 * @param key (string) - the key to unset.
		 */
		this.unset = function(key) {
		
			// make sure there is a key.
			if ( settings[key] ) {
				// delete the key.
				delete settings[key]
			
				// write the change to persistence.
				writeSettings()
			} else {
				// if there is no key then log it.
				console.error("Unable to unset '" + key + "' as it does not exist.")
			}
		}
		
		/**
		 * get a setting.
		 * @param key (string) - the name of the setting.
		 */
		this.get = function(key) {
		
			// return the value.
			return settings[key]
		}
		
		// alias to persistence.clear.
		this.clear = function() {
			
			persistence.clear()
		}
	}
	
	return Settings
})