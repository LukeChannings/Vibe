(function(){

	// define the vibe controller.
	var Vibe = function() {
	
		// define Vibe base dependencies.
		var dependencies = [
				'domReady', // DOM Ready require.js plugin.
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
		
			// wait for the DOM to load...
			domReady(function() {
			
				// get the root node.
				var rootNode = document.getElementById('Vibe')
			
				// instantiate settings model.
				var settings = self.settings = new ModelSettings()
				
				// instantiate settings user interface.
				var uiSettings = self.uiSettings = new UISettings(settings)
			
				// instantiate the Vibe Api.
				var api = self.api = new Api(settings)
			
				// if the browser is mobile, load the mobile stylesheet.
				if ( util.Browser.isMobile() ) util.registerStylesheet('vibe.mobile.css')
			
				// detect SVG support.
				if ( util.Browser.HasSupport.svg() && ! util.Browser.isIE() ) document.body.addClass('svg')
			
			})
		
		})
	
	}
	
	// start your engines...
	new Vibe()
	
})();