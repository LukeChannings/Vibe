//
// Vibe Settings Assistant.
//
// this module contains dialogue definitions for the settings dialogue,
// as well as methods for adding custom panes to the dialogue.
// also, there are a set of standard modal dialogue definitions that can
// be reused elsewhere.
//
define(['util', 'ui.widget.modalDialogue'], function (util, dialogue) {

	// Settings Assistant Constructor.
	// @param options {object} properties with which to configure the instance.
	// @param options.withSettings {object} the settings instance.
	var SettingsAssistant = function(options) {
	
		// check for the settings instance.
		if ( ! util.hasProperties(options, ['withSettings', '_super']) ) {
			throw new Error("Settings Assistant was instantiated without a settings object.")
		} else {
			this.settings = options.withSettings
			this._super = options._super
		}
	
		// object to contain the name of the preference pane,
		// the dialogue definition and the apply callback.
		this.panes = {}
		
		// object containing additional inputs to registered dialogues.
		this.additions = {}
		
		// register the default preference panes.
		for ( var i in this.defaultDefinitions ) {
			this.registerDialogue(this.defaultDefinitions[i])
		}
	}
	
	// shows the settings dialogue.
	// @return {string} the identifier for the settings dialogue.
	SettingsAssistant.prototype.presentDialogue = function() {
	
		// list of dialogue definitions.
		var views = [],
			self = this
		
		// add the panes to the list of views.
		for ( var i in this.panes ) {
		
			var MDD
		
			if ( typeof this.panes[i].MDD == 'function' ) {
				MDD = this.panes[i].MDD.call(this)
			} else {
				MDD = this.panes[i].MDD
			}
			
			// append additional inputs.
			if ( MDD.form && util.hasProperties(this.additions[i], ['inputs', 'callbacks']) ) {
				util.forEach(this.additions[i].inputs, function(input) {
				
					if ( typeof input == 'function' ) {
						MDD.form.inputs.push(input())
					} else {
						MDD.form.inputs.push(input)
					}
				})
			}
			
			views.push(MDD)
		}
		
		if ( views.length > 0 ) {
		
			this.dialogueId = dialogue.createMultiView(
				{
					title : "Settings",
					views : views,
					buttons : {
						apply : {
							title : "Apply",
							callback : function() {
								applyPreferencePane.call(self)
							}
						},
						close : true
					},
					animate : {
						animateIn : "slideInTop",
						animateOut : "slideOutBottom"
					}
				}
			)
		}
	}
	
	// closes the settings dialogue.
	SettingsAssistant.prototype.dismissDialogue = function() {
	
		dialogue.close(this.dialogueId)
	}
	
	// adds a dialogue pane to the settings.
	// @param definition {object|function} modal dialogue definition, 
	// if a function is specified it must return a valid dialogue definition.
	// @return {bool} true if the definition has been registered, false otherwise.
	SettingsAssistant.prototype.registerDialogue = function(definition) {

		// the modal dialogue definition object.
		var MDD = ( typeof definition == 'function' ) ? definition.call(this) : definition

		if ( ! dialogue.isValidMDD(MDD) ) {
			throw new Error("Dialogue is invalid.")
		}
		
		if ( MDD.form && MDD.form.name ) {
		
			// if the dialogue has a form, use the 
			// form name and callback to define the
			// apply method and name.
			this.panes[MDD.form.name] = {
				MDD : ( typeof definition == 'function' ) ? definition : MDD,
				callback : ( typeof MDD.form.callback == 'function' ) ? MDD.form.callback : false
			}
			
			return true
		} else {
		
			// if the dialogue does not have a form then use the
			// definition title as a property name.
			this.panes[MDD.title || MDD.navTitle || "Unknown Name."] = {
				MDD : MDD,
				callback : false
			}
			
			return true
		}
		return false
	}
	
	// adds a dialogue pane to the settings.
	// @param definition {object|function} definition object or function to unregister.
	// @return {bool} true if a registered dialogue was found.
	SettingsAssistant.prototype.unregisterDialogue = function(definition) {
	
		var MDD = ( typeof definition == 'function' ) ? definition() : definition
		
		if ( MDD.form && MDD.form.name && MDD.form.name in this.panes ) {
		
			delete this.panes[MDD.form.name]
			
			return true
		} else if ( (MDD.title || MDD.navTitle || "Unknown Name.") in this.panes ) {
		
			delete this.panes[MDD.title || MDD.navTitle || "Unknown Name."]
			
			return true
		} else {
		
			return false
		}
	}
	
	// shows the connection assistant, a dialogue specifically
	// for configuring the Vibe Server preferences.
	// @param title {string} the title of the dialogue.
	// @param body {string} the body text of the dialogue.
	// @param callback {function} called when the submit button is pressed.
	// @param buttonTitle {string} the text on the submit button. (defaults to 'Submit')
	// @return {string} identifier for the modal dialogue.
	SettingsAssistant.prototype.presentConnectionAssistant = function(title, body, callback, buttonTitle) {
	
		// construct a modal dialogue definition for a first-run dialogue.
		var dialogueDefinition = {
			title : title,
			body : body,
			animate: {
				animateIn : 'slideInTop',
				animateOut : 'fadeOut'
			},
			form : this.defaultDefinitions.connection.call(this).form
		}
		
		// refresh the host and port settings.
		dialogueDefinition.form.inputs[0].placeholder = this.settings.get('host') || 'localhost'
		dialogueDefinition.form.inputs[1].placeholder = this.settings.get('port') || 6232
		
		// overload the default callback method.
		dialogueDefinition.form.callback = callback
		
		// set the submit button text.
		dialogueDefinition.form.buttonTitle = buttonTitle
		
		// present the dialogue.
		this.dialogueId = dialogue.createSingle(dialogueDefinition)
		
		return this.dialogueId
	}
	
	// a set of default settings panes.
	// @return {object} an object with four properties, the values of which
	// will be a valid dialogue definition.
	SettingsAssistant.prototype.defaultDefinitions = {
		
		// Vibe Server preferences.
		connection : function() {
			return {
				title : "Connection",
				body : "Set the Vibe Server's details.",
				form : {
					name : "connection",
					inputs : [{
						name : 'host',
						title : 'Host',
						placeholder : this.settings.get('host') || 'localhost'
					},{
						name : 'port',
						type : 'number',
						title : 'Port',
						placeholder : this.settings.get('port') || 6232
					}],
					callback : function(input, callback) {
					
						var host = input.host.value || input.host.placeholder
						
						var port = input.port.value || input.port.placeholder
					
						if ( host !== input.host.placeholder || port !== input.port.placeholder ) {
						
							this.settings.set('host', host)
							
							this.settings.set('port', port)
						
							location.reload() 
						}
					}
				}
			}
		},
		
		// user interface options.
		userInterface : function() {
			return {
				title : "User Interface",
				body : "Configure the User Interface.",
				form : {
					name : "interface",
					inputs : [{
						name : 'collectionRootType',
						title : 'Order Collection By ',
						type : 'select',
						options : ['Genre', 'Artist', 'Album', 'Track'],
						placeholder : this.settings.get('collectionRootType') || 'Genre'
					}],
					callback : function(inputs) {
					
						if ( inputs.collectionRootType.value !== inputs.collectionRootType.placeholder ) {
						
							this._super.collection.populateWithType(inputs.collectionRootType.value)
						
							this.settings.set('collectionRootType', inputs.collectionRootType.value)
						}
					}
				}
			}
		},
		
		// advanced settings.
		advanced : function() {
			return {
				title : "Developer",
				body : "Advanced configuration options for developmental purposes.",
				form : {
					name : "developer",
					inputs : [{
						name : 'debug',
						title : 'Debugging',
						type : 'checkbox',
						checked : this.settings.get('debug')
					},{
						name : 'Clear Settings',
						type : 'button',
						callback : function() {
						
							localStorage.vibeSettings = undefined
							
							location.reload(true)
						}
					},{
						name : "Clear playlist",
						type : "button",
						callback : function() {
						
							localStorage.ModelPlaylist = undefined
							
							location.reload()
						}
					}],
					callback : function(input) {
					
						if ( input.debug.checked != this.settings.get('debug') ) {
						
							this.settings.set('debug', input.debug.checked)
							
							location.reload(true)
						}
					}
				}
			}
		},
		
		// information about Vibe.
		about : {
			title : "About Vibe",
			body : (function() {
				
				var build = util.getMetaContent('vibe-build'),
					version = util.getMetaContent('vibe-version'),
					result = ""
				
				result += "<p style='font-size:14px'><strong>Version:</strong> " + version + "</p>"
				
				if ( build !== 'buildno' ) {
					result += "<p style='font-size:14px'><strong>Build:</strong> " + '<a href="https://github.com/TheFuzzball/Vibe/tree/' + build + '">' + build + '</a>' + "</p>"
				}
				
				return result
				
			})() + "<p style='font-size:14px'><img src='./images/shared.icon_alt.png' alt style='float:left' />Vibe is a next-generation Web Application that will stream music from a Vibe Server and allow it to be played on the browser. Vibe aims to provide an intuitive and fast User Interface by using the latest Web Technologies available.</p>" + "<p style='font-size:14px'>Although the major components of this program are done, it still requires serious polish and won't be fully ready for some time.</p>",
			alignment : "justify"
		}
	}
	
	// allows an input to be added to an existing preference pane.
	// @param pane {string} name of the preference pane.
	// @param input {object} the definition for the input according to the MDD spec.
	// @param callback {function} function called when the input is applied.
	// @return {bool} true if the input is added, false otherwise.
	SettingsAssistant.prototype.appendInput = function(pane, input, callback) {
	
		if ( pane in this.panes ) {
		
			if ( ! this.additions[pane] ) {
				this.additions[pane] = {
					inputs : [],
					callbacks : []
				}
			}
			
			this.additions[pane].inputs.push(input)
			this.additions[pane].callbacks.push(callback)
		
			return true
		
		} else {
			return false
		}
	}
	
	// calls the apply callback for the current preference pane.
	function applyPreferencePane() {
	
		var form = document.forms[0],
			self = this
	
		if ( form.name in this.panes ) {
		
			var inputs = document.forms[form.name].elements
		
			this.panes[form.name].callback.call(this, inputs)
			
			// run additional callbacks.
			if ( util.hasProperties(this.additions[form.name], ['callbacks', 'inputs']) ) {
				util.forEach(this.additions[form.name].callbacks, function(callback) {
				
					callback.call(self, inputs)
				})
			}
		}
	}
	
	// export the module.
	return SettingsAssistant
})