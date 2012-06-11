/**
 * Settings
 * @description Provides a modal frontend with which to change application settings.
 */
define(['util/methods','UI/Widget/ModalDialogue/ModalDialogue'], function(util, dialogue) {

	/**
	 * constructs an instance of the settings interface.
	 * @param vibe {object} global vibe instance.
	 */
	var Settings = function(vibe) {
	
		var vibe = this.vibe = vibe
	
		var settings = vibe.settings
	
		// contains the pane MDD and apply method.
		this.panes = {}
	
		// get the default panes.
		var Panes = this.defaultPanes = {
			"connection" : {
				'title' : "Connection",
				'body' : "Below are the details of the Vibe Server.",
				'form' : {
					'name' : 'connection',
					'inputs' : [{
						'name' : 'host',
						'title' : 'Host',
						'placeholder' : settings.get('host') || 'localhost'
					},{
						'name' : 'port',
						'type' : 'number',
						'title' : 'Port',
						'placeholder' : settings.get('port') || 6232
					}],
					'callback' : function(input, callback) {
					
						var host = input.host.value || input.host.placeholder
					
						var port = input.port.value || input.port.placeholder
					
						if ( host !== input.host.placeholder || port !== input.port.placeholder ) {
						
							settings.set('host', host)
							
							settings.set('port', port)
						
							dialogue.close()
						
							if ( typeof callback == 'function' ) {
							
								// execute the callback.
								callback()
							
								// update the placeholders.
								this.MDD.form.inputs[0].placeholder = host
								this.MDD.form.inputs[1].placeholder = port
							
							}
							
							else location.reload() 
						
						}
					}
				}
			},
			
			"userinterface" : {
				'title' : 'User Interface',
				'body' : 'User Interface preferences.',
				'form' : {
					'name' : 'userinterface',
					'inputs' : [{
						'name' : 'collectionRootType',
						'title' : 'Order Collection By ',
						'type' : 'select',
						'options' : ['Genre', 'Artist', 'Album', 'Track'],
						'placeholder' : settings.get('collectionRootType') || 'Genre'
					}],
					'callback' : function(inputs) {
				
						if ( inputs.collectionRootType.value !== inputs.collectionRootType.placeholder ) {
						
							vibe.collection.populateWithType(inputs.collectionRootType.value)
						
							settings.set('collectionRootType', inputs.collectionRootType.value)
						
							this.MDD.form.inputs[0].placeholder = inputs.collectionRootType.value
						
						}
				
					}
				}
			},
			
			"advanced" : {
				'title' : 'Advanced',
				'body' : 'Developer options for serious hardcore developers and what-not.',
				'form' : {
					'name' : 'developer',
					'inputs' : [{
						'name' : 'debug',
						'title' : 'Debugging',
						'type' : 'checkbox',
						'checked' : settings.get('debug')
					},{
						'name' : 'Clear Settings',
						'type' : 'button',
						'callback' : function() {
						
							// clear localstorage.
							localStorage.clear()
							
							location.reload(true)
						
						}
					}],
					'callback' : function(input) {
					
						if ( input.debug.checked ) {
						
							settings.set('debug', true)
						
							location.reload(true)
						
						}
					
					}
				}
			},
			"about" : {
				'title' : (function() {
				
					if ( util.getMetaContent('vibe-build') ) {
					
						return 'About Vibe (Build ' + util.getMetaContent('vibe-build') +  ' )'
					}
					else {
					
						return 'About Vibe (Version ' + util.getMetaContent('vibe-version') + ')'
					}
				})(),
				'navTitle' : 'About Vibe',
				'body' : '<img src="images/icon.png" style="float:left" alt /><p>Vibe is a Web Application for streaming music. Just enter the Url of your Vibe Server and you\'re ready to go.</p><p>Vibe is an open source project that is written entirely in Javascript, and can be found on GitHub <a href="https://github.com/TheFuzzball/Vibe">here</a>.</p><p>Vibe will run in most Web Browsers (IE8+, Chrome, FireFox 3.5+), but is best enjoyed in a modern W3C-standard browser.',
				'alignment' : 'justify'
			}
		}
	
		// register all panes in the Pane object.
		for ( var pane in Panes ) this.addPane(Panes[pane])
	
	}

	Settings.prototype.show = function() {
	
		var views = []
		
		for ( var i in this.panes ) {
		
			views.push(this.panes[i].MDD)
		
		}
		
		if ( views.length > 0 ) { 
		
			// create the form.
			dialogue.createMultiView({
				'title' : 'Settings',
				'views' : views,
				'buttons' : {'apply' : {'title' : 'Apply', 'callback' : this.apply, 'context' : this }, 'close' : true },
				'animate' : {
					'animateIn' : 'slideInTop',
					'animateOut' : 'slideOutTop'
				}
			})
		
		}
	}

	/**
	 * delegates to the apply method associated with the current pane.
	 * @param form {string} name of the current form.
	 * @param message any parameter that will be passed as the second variable to the callback.
	 */
	Settings.prototype.apply = function(form, message) {
	
		var form = document.forms[0]
	
		if ( form.name in this.panes ) {
		
			var inputs = document.forms[form.name].elements
		
			this.panes[form.name].applyMethod(inputs, message)
		
		}
	
		else throw util.error('There is no pane registered with that name.')
	
	}

	/**
	 * registers a settings pane.
	 * @param MDD {object} Modal Dialogue definition for the pane.
	 */
	Settings.prototype.addPane = function(MDD) {
	
		// check for a form.
		if ( MDD.form && MDD.form.name ) {
	
			this.panes[MDD.form.name] = {
				'MDD' : MDD,
				// map the form callback to the apply method.
				'applyMethod' : (typeof MDD.form.callback == 'function') ? MDD.form.callback : function() {}
			}
	
		}
		
		else {
		
			this.panes[MDD.title] = {
				'MDD' : MDD,
				'applyMethod' : false
			}
		
		}
		
	}
	
	/**
	 * unregisters a form from the settings pane.
	 * @param name {string} either the name of the form or the title of the MDD.
	 */
	Settings.prototype.removePane = function(name) {
	
		try {
			delete this.panes[name]
		}
		catch (ex) {
		
			throw ex
		
		}
	}
	
	Settings.prototype.firstrun = function(callback, title, body) {
	
		var self = this,
		settings = this.settings

		var MDD = {
			'title' : title || "Welcome to Vibe!",
			'body' : body || "<p>Before you can use Vibe, the address of your Vibe Server must be specified.</p><p>You can find the address of your Vibe Server by looking in its main window, where the address will be specified in the format of: hostname:portnumber.</p>",
			'errorDialogue' : !! title,
			'form' : self.defaultPanes.connection.form
		}
		
		// override the callback.
		MDD.form.callback = function() {
		
			// route through the associated callback handler.
			self.apply('connection', callback)
		
		}
	
		// set animation for error or first run.
		MDD.animate = ( !! title ) ? {
			'animateIn' : 'slideInTop',
			'animateOut' : 'slideOutTop'
			} : {
			'animateIn' : 'fadeIn',
			'animateOut' : 'fadeOut'
		}
	
		// create the dialogue.
		dialogue.createSingle(MDD)
	
	}

	return Settings

})