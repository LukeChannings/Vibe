(function(){

	// define the vibe controller.
	var Vibe = function(callback) {
	
		// define Vibe base dependencies.
		var dependencies = [
				'dependencies/domReady', // DOM Ready require.js plugin.
				'util', // require utility methods.
				'Model/Settings', // Settings Model.
				'UI/Settings/Settings', // Settings UI.
				'Api/Vibe', // Vibe Api.
				'Model/Init' // UI Initialisation.
			],
			self = this
	
		// set require.js base url.
		require.config({baseUrl: './modules/'})
	
		// fetch the dependencies...
		require(dependencies, function(domReady, util, ModelSettings, UISettings, Api, Init) {
		
			// get the root node.
			var rootNode = self.rootNode = document.getElementById('Vibe')
		
			// instantiate settings model.
			var settings = self.settings = new ModelSettings()
			
			// instantiate settings user interface.
			var uiSettings = self.uiSettings = new UISettings(self)
		
			self.init = Init
		
			// instantiate the Vibe Api.
			var api = self.api = new Api(settings)
		
			if ( typeof callback == 'function' ) callback.call(self)
		
			// wait for the DOM to load...
			domReady(function() {
			
				// if the browser is mobile, load the mobile stylesheet.
				if ( util.Browser.isMobile() ) util.registerStylesheet('vibe.mobile.css')
			
				// detect SVG support.
				if ( util.Browser.HasSupport.svg() && ! util.Browser.isIE() ) document.body.addClass('svg')
				
				// set the vibe version.
				settings.set('version', util.getMetaContent('vibe-version'))
			
				// listen for a connection event.
				api.once('connected', function() {
				
					// initialise the mobile interface if the device is mobile.
					if ( util.Browser.isMobile() ) Init.mobile.call(self)
					
					// otherwise initialise the desktop interface.
					else Init.desktop.call(self)
				
				})
				
				// listen for an error.
				api.once('error', function() {
				
					// error message.
					var message = "<p>Vibe was unable to connect to '" + settings.get('host') + ':' + settings.get('port') + "'.</p>"
					message += "<p>Please check the Vibe Server is running, and that the address for the server is correct.</p>"
					message += "<p>If the address is incorrect, please change it in the form below. Otherwise, press 'Go'.</p>"
				
					// create an error dialogue.
					uiSettings.firstrun.call(self,function() {
					
						api.connect()
					
					},"Unable to connect.", message)
				
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
	
		if ( this.settings.get('debug') ) window.vibe = vibe
	
	})
	
})();