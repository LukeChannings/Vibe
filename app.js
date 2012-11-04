/**
 * Vibe initialisation script.
 * - Loads the Api, does connection, initialises UI, etc.
 */
void function() {

	var util = this.util // utility methods.
	  , api // Vibe Api client.
	  , settings // Vibe Settings.
	  , settingsAssistant // settings interface.
	  , interfaceHasBeenInitialised = false
	  , modal = null
	  , initialiser = null
	  , sha256  = null
	  , self = this // reference to the current object.
	  , sm2Loaded = false

	  , throbberId // dialogue identifier.
	  , throbber // throbber element.
	
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
			  "util" // utility methods.
			, "api.vibe" // Vibe Api.
			, "model.settings" // Application settings.
			, "lib/domReady!" // requirejs plugin to wait for the DOM to load.
		],
		
		// call the init function when the dependencies are loaded.
		callback : init
	})
	
	// initialisation method
	// will be run when requirejs has loaded
	// and basic dependencies are ready.
	function init(util, Api, Settings) {
	
		var dependencies = [
			  "ui.initialiser" // bootstraps the UI modules.
			, "ui.widget.modalDialogue" // presents various modal dialogues.
			, "ui.settingsAssistant" // settings interface.
			, "lib/sha-256" // sha-256 utility to calculate digest hash.
		]
	
		// webkit notifications.
		if ( window.webkitNotifications ) {
			dependencies.push("api.webkitNotifications")
		}
	
		// compatibility for IE8.
		if ( util.browser.isIE8 ) {
			dependencies.push("compatibility.ie8")
		}

		require(dependencies, function(interfaceInitialiser, modalDialogue, SettingsAssistant, _sha256, Notifications) {
		
			throbber = util.createElement({
				'tag' : 'div',
				'className' : 'loading',
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
		
			sha256 = _sha256

			// display a loading throbber.
			throbberID = modal.open(throbber)
			
			// instantiate the Api.
			self.api = api = new Api({
				
				// get the host and port from settings and set them,
				// if they're undefined then the instance will emit
				// vibeApiDidThrowError.
				  host : settings.get('host')
				, port : settings.get('port')
				, username : settings.get('username')
				, digest : settings.get('digest')
				, token : settings.get('token')
				
				, onconnect : vibeApiDidConnect
				
				, ondisconnect : vibeApiDidDisconnect
				
				, onerror : vibeApiDidThrowError
				
				, onreconnect : vibeApiDidReconnect
				
				, onexternalevent : vibeExternalEventResponder

				// automatically invoke the connect method.
				, autoconnect : true
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
	
		var host = ( inputs[0].value ) ? inputs[0].value : 'localhost'
		  , port = ( inputs[1].value ) ? inputs[1].value : 6232
		  , username = inputs[2].value
		  , password = inputs[3].value
		
		api.getToken("http://" + host + ":" + port, function(err, token) {

			if ( ! err ) {

				settings.set('host', host)
				settings.set('port', port)

				// get a token from the server.

				settings.set('username', username)
				settings.set('digest', sha256.hash( sha256.hash(username + token) + sha256.hash(username + password) ))
				settings.set('token', token)

				api.host = host
				api.port = port
				api.username = username
				api.digest = settings.get('digest')
				api.token = token
			
				// close the dialogue.
				if ( modal.hasDialogue(connectionAssistantId) ) {
					modal.close(connectionAssistantId)
				}
				
				throbberID = modal.open(throbber)
				
				api.connect()
			} else {

				vibeApiDidThrowError()
			}
		})
	}
	
	// called when the Api connects.
	function vibeApiDidConnect() {

		if ( ! sm2Loaded ) {

			require(['lib/soundmanager2'], function() {

				soundManager.setup({
					  url : 'lib/'
					, debugMode : false
					, allowScriptAccess : 'always'
					, flashVersion : 9
					, preferFlash : true
					, wmode : 'transparent'
					, useHighPerformance : true
				})

				loadUI()

				sm2Loaded = true
			})

		} else {

			loadUI()
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
		
		connectionAssistantId = settingsAssistant.presentConnectionAssistant(
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
		if ( ! settings.get('host') || ! settings.get('port') || ! settings.get('username') || !settings.get('digest') ) {

			connectionAssistantId = settingsAssistant.presentConnectionAssistant(
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
		
			connectionAssistantId = settingsAssistant.presentConnectionAssistant(
				"Vibe failed to connect.",
				
				"<p>We could not connect to the Vibe Server at http://" + settings.get('host') + ':' + settings.get('port') + ", please check that this server is up, or if you have incorrectly entered the details you can change them below. When you're done just press reconnect.</p>",
				
				connectionAssistantHandler,
				
				"Reconnect"
			)
		}
	}

	// routes external control events.
	function vibeExternalEventResponder( event, options ) {

		switch ( event ) {

			case "playToggle":

				if ( self.playlistModel.model.length !== 0 ) {

					self.playerModel.playToggle()
				}

				break;

			case "setVolume":

				self.playerModel.setVolume(options.volume)

				break;

			case "skipTrack":

				self.playerModel.skip(options.direction)

				break;

			case "showMessage":

				modal.createSingle(options)
		}
	}

	function loadUI() {

		if ( ! interfaceHasBeenInitialised ) {
			initialiser.call(self, function () {
			
				if ( settings.get('debug') ) {
				
					window.vibe = self
				} else {

					// expose an interface for plugins.
					window.vibe = {

						// methods for adding custom context menus.
						contextMenu : {
							addContext : self.contextMenu.addContext,
							addContextItem : self.contextMenu.addContextItem,
							getContext : self.contextMenu.getContext
						},

						// methods for adding custom settings panes.
						settingsAssistant : {
							registerDialogue : self.settingsAssistant.registerDialogue,
							presentDialogue : self.settingsAssistant.presentDialogue
						},

						// methods for adding custom keyboard shortcuts.
						keyboardShortcutManager : self.keyboardShortcutManager
					}
				}
			
				// stop the throbber.
				if ( modal.hasDialogue(throbberID) ) {
					modal.close(throbberID)
				}
			})
		}
	}

}.call({})