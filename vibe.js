/**
 * Vibe
 * @description Official Vibe Web App.
 */
(function(){

	// create a controller object to contain important properties that we don't want leaking into the global scope.
	var Vibe = function() {
	
		var self = this,
			dependencies = [
				'dependencies/domReady',
				'util',
				'Model/Settings',
				'UI/Settings/Settings',
				'Api/Vibe',
				'Model/Init'
			];
	
		// requirejs configuration.
		require.config({baseUrl: './modules/'});
	
		require(dependencies, function (domReady, util, ModelSettings, UISettings, Api, ModelInit) {
		
			domReady(function(){
			
				// initial variables.
				var vibeRootElement = self.vibeRootElement = document.getElementById('Vibe'),
					settings = self.settings = new ModelSettings(),
					uiSettings = self.uiSettings = new UISettings(settings),
					api = self.api = new Api(settings);
			
				// check if the browser is mobile.
				if ( util.Browser.isMobile() )
				{
					// add the mobile stylesheet additions if it is.
					util.registerStylesheet("./vibe.mobile.css");
				}
				
				// check for SVG support.
				if ( util.Browser.HasSupport.svg() && ! util.Browser.isIE() )
				{
					// add the SVG class to the body.
					document.body.addClass('svg');
				}
			
				// set the vibe version.
				settings.set('version', util.getMetaContent('vibe-version'));
			
				// listen for a connection event.
				api.once('connected',function(){
				
					if ( util.Browser.isMobile() )
					{
						ModelInit.mobile.call(self);
					}
					else
					{
						ModelInit.desktop.call(self);
					}
				
				});
				
				// listen for an error.
				api.once('error',function(){
				
					uiSettings.firstrun.call(self,function(){
					
						api.connect();
					
					},"Unable to connect.","<p>Vibe was unable to connect to '" + settings.get('host') + ':' + settings.get('port') + "'.</p> <p>Please check the Vibe Server is running, and that the address for the server is correct.</p><p>If the address is incorrect, please change it in the form below. Otherwise, press 'Go'.</p>");
				
				});
				
				api.once('firstrun',function(){
				
					// run the first run dialogue.
					uiSettings.firstrun.call(self,function(){
					
						// attempt to reconnect using the new settings.
						api.connect();
					
					});
				
				});
				
			});
		
		});
	
	}
	
	// start up the engines...
	new Vibe();
	
})();