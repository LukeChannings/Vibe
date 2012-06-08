(function(){

	/**
	 * Fetches base dependencies, creates an Api instance and initialises the interface.
	 * @param callback {function} called when vibe has initialised.
	 */
	var Vibe = function(callback) {
	
		var self = this
	
		// set require.js base url.
		require.config({baseUrl: './modules/'})
	
		// fetch the dependencies...
		require([
				'dependencies/domReady', // DOM Ready require.js plugin.
				'util', // require utility methods.
				'Model/Settings', // Settings Model.
				'UI/Settings/Settings', // Settings UI.
				'Api/Vibe', // Vibe Api.
				'Model/Init', // UI Initialisation.,
				'UI/ModalDialogue/ModalDialogue' // modal dialogue for loading.
			],
			function(domReady, util, ModelSettings, UISettings, Api, Init, dialogue) {
		
			// wait for the DOM to load...
			domReady(function() {
			
				var rootNode = self.rootNode = document.getElementById('Vibe'), // Vibe root element.
					settings = self.settings = new ModelSettings(), // settings model instance.
					uiSettings = self.uiSettings = new UISettings(self), // settings interface
					api = self.api = new Api(settings) // settings instance.
				
				self.init = Init
				
				dialogue.open(util.createElement({
					'tag' : 'div',
					'customClass' : 'loading'
				}))
			
				if ( typeof callback == 'function' ) callback.call(self)
			
				// if the browser is mobile, load the mobile stylesheet.
				if ( util.Browser.isMobile() ) util.registerStylesheet('vibe.mobile.css')
			
				// detect SVG support.
				if ( util.Browser.HasSupport.svg() && ! util.Browser.isIE() ) document.body.addClass('svg')
				
				// listen for a connection event.
				api.once('connected', function() {
				
					// initialise the mobile interface if the device is mobile.
					if ( util.Browser.isMobile() ) Init.mobile.call(self)
					
					// otherwise initialise the desktop interface.
					else Init.desktop.call(self, function() {
					
						// when the desktop interface is initialised close the loading dialogue.
						dialogue.close()
					})
				})
				
				// listen for an error.
				api.once('error', function() {
				
					// error message.
					var message = "<p>Vibe was unable to connect to '" + settings.get('host') + ':' + settings.get('port') + "'.</p>"
					message += "<p>Please check the Vibe Server is running, and that the address for the server is correct.</p>"
					message += "<p>If the address is incorrect, please change it in the form below. Otherwise, press 'Go'.</p>"
				
					// create an error dialogue.
					uiSettings.firstrun(function() {
					
						api.connect()
					
					}, "Unable to connect.", message)
				
				})
				
				api.once('firstrun', function() {
				
					// first run dialogue.
					uiSettings.firstrun(function() {
					
						// attempt to reconnect using the new settings.
						api.connect()
					})
				})
			})
		})
	}
	
	// start your engines...
	var vibe = new Vibe(function() {
	
		// if we're debugging then expose the vibe instance.
		if ( this.settings.get('debug') ) window.vibe = vibe
		
		// if we're not debugging then expose only the settings instance. (for plugins.)
		else window.vibe = {
			settings : this.uiSettings,
			player : this.modelPlayer
		}
	})
	
})()
