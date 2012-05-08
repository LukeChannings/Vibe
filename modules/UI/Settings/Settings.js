/**
 * Settings
 * @description Provides a modal frontend with which to change application settings.
 */
define(['util','UI/ModalDialogue/ModalDialogue'],function(util, dialogue){

	var Settings = function(settings) {
	
		this.settings = settings
	
	}

	Settings.prototype.show = function() {
	
		var self = this,
			settings = this.settings
	
		var ConnectionOptions = {
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
				}]
			}
		}

		// developer pane.
		var Developer = {
			'title' : 'Developer',
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
					
						settings.clear()
						
						location.reload(true)
					
					}
				}]
			}
		}
	
		var About = {
			'title' : 'About Vibe (Version ' + this.settings.get('version') + ')',
			'navTitle' : 'About Vibe',
			'body' : '<img src="images/icon.png" style="float:left" alt /><p>Vibe is a Web Application for streaming music. Just enter the Url of your Vibe Server and you\'re ready to go.</p><p>Vibe is an open source project that is written entirely in Javascript, and can be found on GitHub <a href="https://github.com/TheFuzzball/MusicMe-WebApp">here</a>.</p><p>Vibe will run in most Web Browsers (IE8+, Chrome, FireFox 3.5+), but is best enjoyed in a modern W3C-standard browser.',
			'alignment' : 'justify'
		}
		
		var apply = function() {
		
			var form = document.forms[0]
		
			if ( form ) {
		
				switch (form.name) {
					case "connection":
					
						// get the new host and port from the form.
						var host = form['host'].value || form['host'].placeholder || 'localhost'
					
						var port = form['port'].value || form['port'].placeholder || 6232
					
						if ( host !== settings.get('host') || port !== settings.get('port') ) {
						
							settings.set('host', host)
						
							settings.set('port', port)
						
							// reload Vibe.
							location.reload(true)
						
						}
					
					break
					case "developer":
					
						settings.set('debug', form['debug'].checked)
					
						location.reload(true)
					
				}
		
			}
		
		}
		
		dialogue.createMultiView({
			'title' : 'Settings',
			'views' : [ConnectionOptions, Developer, About],
			'buttons' : {'Apply' : apply, 'close' : true },
			'animate' : {
				'animateIn' : 'slideInTop',
				'animateOut' : 'slideOutTop'
			}
		})
	}

	Settings.prototype.firstrun = function(callback, title, body) {
	
		var self = this
	
		var MDD = {
			'title' : title || "Welcome to Vibe!",
			'body' : body || "<p>Before you can use Vibe, the address of your Vibe Server must be specified.</p><p>You can find the address of your Vibe Server by looking in its main window, where the address will be specified in the format of: hostname:portnumber.</p>",
			'errorDialogue' : !! title,
			'form' : {
				'name' : 'firstrun',
				'inputs' : [{
					'name' : 'host',
					'title' : 'Host',
					'placeholder' : this.settings.get('host') || 'localhost'
				},{
					'name' : 'port',
					'type' : 'number',
					'title' : 'Port',
					'placeholder' : this.settings.get('port') || 6232
				}],
				'callback' : function(inputs){
					
					var host = inputs[0].value || inputs[0].placeholder
					var port = inputs[1].value || inputs[1].placeholder
					
					self.settings.set('host',host)
					self.settings.set('port',port)
				
					callback.call(this,host,port)
				
					this.close()
				
				},
				'buttonTitle' : 'Go'
			}
		}
	
		// set animation for error or first run.
		MDD.animate = ( !! title ) ? { 'animateIn' : 'slideInTop', 'animateOut' : 'slideOutTop' } : { 'animateIn' : 'fadeIn', 'animateOut' : 'fadeOut' }
	
		// create the dialogue.
		dialogue.createSingle(MDD)
	
	}

	return Settings

})