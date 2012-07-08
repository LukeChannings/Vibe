//
// Settings Assistant
// allows the user to configure Vibe's settings 
// when the Vibe Api is in a state of disconnect.
//

define(['util','ui.widget.modalDialogue'], function(util, modal) {

	/**
	 * constructs an instance of the settings interface.
	 * @param vibe {object} global vibe instance.
	 */
	var SettingsAssistant = function(options) {

		if ( ! options.withSettings ) {
			throw new Error("Settings Assistant cannot be created with no settings instance.")
		}

		var settings = this.settings = options.withSettings

		this.panes = {}

		// register all panes in the Pane object.
		for ( var pane in settings.dialogueDefinitions ) {
			this.addPane(settings.dialogueDefinitions[pane])
		}
	}

	SettingsAssistant.prototype.presentDialogue = function() {
	
		var views = []
		
		for ( var i in this.panes ) {
		
			views.push(this.panes[i].MDD)
		}
		
		if ( views.length > 0 ) { 
		
			// create the form.
			this.dialogueId = modal.createMultiView({
				title : 'Settings',
				views : views,
				buttons : {
					apply : {
						title : 'Apply',
						callback : this.apply,
						context : this
					},
					close : true
				},
				animate : {
					animateIn : 'slideInTop',
					animateOut : 'slideOutTop'
				}
			})
		} else {
			console.log("Settings Assistant cannot be run with no panes.")
		}
	}

	SettingsAssistant.prototype.dismissDialogue = function() {
	
		modal.close(this.dialogueId)
	}

	/**
	 * delegates to the apply method associated with the current pane.
	 */
	SettingsAssistant.prototype.apply = function() {
	
		var form = document.forms[0]
	
		if ( form.name in this.panes ) {
		
			var inputs = document.forms[form.name].elements
		
			this.panes[form.name].applyMethod.call(modal, inputs)
		
		} else {
			throw new Error('There is no pane registered with that name.')
		}
	}

	/**
	 * registers a settings pane.
	 * @param MDD {object} Modal Dialogue definition for the pane.
	 */
	SettingsAssistant.prototype.addPane = function(MDD) {
	
		// check for a form.
		if ( MDD.form && MDD.form.name ) {
			this.panes[MDD.form.name] = {
				MDD : MDD,
				// map the form callback to the apply method.
				applyMethod : (typeof MDD.form.callback == 'function') ? MDD.form.callback : function() {}
			}
		} else {
		
			this.panes[MDD.title] = {
				MDD : MDD,
				applyMethod : false
			}
		}
	}
	
	/**
	 * unregisters a form from the settings pane.
	 * @param name {string} either the name of the form or the title of the MDD.
	 */
	SettingsAssistant.prototype.removePane = function(name) {
	
		try {
			delete this.panes[name]
		} catch (ex) {
			throw ex
		}
	}
	
	return SettingsAssistant
})