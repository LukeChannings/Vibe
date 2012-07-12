/**
 * Vibe initialisation script.
 * - Loads the Api, does connection, initialises UI, etc.
 */
void function() {

	var util = this.util, // utility methods.
		api, // Vibe Api client.
		settings, // Vibe Settings.
		settingsAssistant, // settings interface.
		interfaceHasBeenInitialised = false,
		modal = null,
		initialiser = null,
		self = this, // reference to the current object.

	// dialogue identifier.
	throbberId,
	
	// throbber element.
	throbber
	
	// configure require.js
	require.config({
	
		// base path for the modules.
		baseUrl : "src",
		
		// extra path prefixes.
		paths : {
			lib : "../lib",
			image : "../images",
			stylesheet : "../stylesheets"
		},
		
		// initial callback dependencies.
		deps : [
			"util", // utility methods.
			"api.vibe", // Vibe Api.
			"model.settings", // Application settings.
			"lib/domReady!", // requirejs plugin to wait for the DOM to load.
		],
		
		// call the init function when the dependencies are loaded.
		callback : init
	})
	
	// initialisation method
	// will be run when requirejs has loaded
	// and basic dependencies are ready.
	function init(util, Api, Settings) {
	
		var dependencies = [
			"ui.initialiser", // bootstraps the UI modules.
			"ui.widget.modalDialogue", // presents various modal dialogues.
			"ui.settingsAssistant" // settings interface.
		]
	
		// webkit notifications.
		if ( /Webkit/i.test(navigator.userAgent) ) {
			dependencies.push("api.webkitNotifications")
		}
	
		// compatibility for IE8.
		if ( util.browser.isIE8 ) {
			dependencies.push("compatibility.ie8")
		}
	
		require(dependencies, function(interfaceInitialiser, modalDialogue, SettingsAssistant, Notifications) {
		
			throbber = util.createElement({
				'tag' : 'div',
				'customClass' : 'loading',
				'id' : 'LoadingThrobber'
			})
		
			// instantiate settings.
			self.settings = settings = new Settings('vibeSettings')
		
			self.settingsAssistant = settingsAssistant = new SettingsAssistant({
				withSettings : settings,
				_super : self
			})
		
			if ( Notifications ) {
				Notifications.addPreferenceInput(settingsAssistant)
			}
		
			modal = modalDialogue
		
			initialiser = interfaceInitialiser
		
			// display a loading throbber.
			throbberID = modal.open(throbber)
			
			// instantiate the Api.
			self.api = api = new Api({
				
				// get the host and port from settings and set them,
				// if they're undefined then the instance will emit
				// vibeApiDidThrowError.
				host : settings.get('host'),
				port : settings.get('port'),
				
				onconnect : vibeApiDidConnect,
				
				ondisconnect : vibeApiDidDisconnect,
				
				onerror : vibeApiDidThrowError,
				
				onreconnect : vibeApiDidReconnect,
				
				// automatically invoke the connect method.
				autoconnect : true
			})
		})
	}
	
	//
	// handles the callback from the form definition specified
	// in settings.dialogueDefinitions.connection.form, sets
	// the settings and api properties and reconnects the Api.
	// @param inputs {array} the form inputs.
	//
	function connectionAssistantHandler(inputs) {
	
		var host = ( inputs[0].value ) ? inputs[0].value : 'localhost',
			port = ( inputs[1].value ) ? inputs[1].value : 6232
		
		settings.set('host', host)
		settings.set('port', port)
	
		api.host = host
		api.port = port
	
		// close the dialogue.
		if ( modal.hasDialogue(connectionAssistantId) ) {
			modal.close(connectionAssistantId)
		}
		
		throbberID = modal.open(throbber)
		
		api.connect()
	}
	
	// called when the Api connects.
	function vibeApiDidConnect() {

		if ( ! interfaceHasBeenInitialised ) {
			initialiser.call(self, function () {
			
				if ( settings.get('debug') ) {
				
					window.vibe = self
				}
			
				// stop the throbber.
				if ( modal.hasDialogue(throbberID) ) {
					modal.close(throbberID)
				}
			})
		}
	}
	
	// called when the Api reconnects.
	function vibeApiDidReconnect() {
	
		// tell interface elements that connection to the server has been regained.
		initialiser.alertInterfaceToReconnection()
		
		// close the dialogue.
		if ( modal.hasDialogue(connectionAssistantId) ) {
			modal.close(connectionAssistantId)
		}
	}
	
	// called when the Api disconnects.
	function vibeApiDidDisconnect() {
	
		// tell interface elements that connection to the server has been lost.
		initialiser.alertInterfaceToDisconnection()
		
		settingsAssistant.presentConnectionAssistant(
			"Vibe lost connection to the server.",
			
			"<p>Connection to the Vibe Server has been lost, please check your connection to the Internet has not been terminated and that your Vibe Server has not been turned off.</p><p>If your connection settings need to be adjusted, please change them below and press Reconnect.</p><p>Note: Once connection is restored this dialogue will automatically close.</p>",
			
			connectionAssistantHandler,
			
			"Reconnect"
		)
	}
	
	// called when the Api has an error.
	function vibeApiDidThrowError(err) {

		// stop the throbber.
		if ( modal.hasDialogue(throbberID) ) {
			modal.close(throbberID)
		}
	
		// if this is the first time Vibe has been run
		// then show a welcome dialogue with options
		// for configuring the host and port.
		if ( ! settings.get('host') && ! settings.get('port') ) {

			settingsAssistant.presentConnectionAssistant(
				"Welcome to Vibe!",
				
				"<p>Before you can use Vibe, the address of your Vibe Server must be specified.</p><p>You can find the address of your Vibe Server by looking in its main window, where the address will be specified in the format of: hostname:portnumber.</p>",
				
				connectionAssistantHandler,
				
				"Go"
			)
		}
		
		// if this is a connection error, show a dialogue
		// advising the user to check their settings, with
		// the option of changing their host and port.
		else {
		
			settingsAssistant.presentConnectionAssistant(
				"Vibe failed to connect.",
				
				"<p>We could not connect to the Vibe Server at http://" + settings.get('host') + ':' + settings.get('port') + ", please check that this server is up, or if you have incorrectly entered the details you can change them below. When you're done just press reconnect.</p>",
				
				connectionAssistantHandler,
				
				"Reconnect"
			)
		}
	}

}.call({})