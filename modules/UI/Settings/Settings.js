/**
 * Settings
 * @description Provides a modal frontend with which to change application settings.
 */
define(['util','UI/ModalDialogue/ModalDialogue'],function(util, dialogue){

	var commitSettings = function() {}

	var MDD;

	var Settings = function(settings) {
	
		this.settings = settings;
	
		var UIView = {
			'title' : 'User Interface Preferences',
			'navTitle' : 'UI Preferences',
			'body' : 'No n00bz aloud. Init.' 
		};
	
		var ConnectionView = {
			'title' : "Connection",
			'body' : "Below are the details of the Vibe Server.",
			'form' : {
				'name' : 'connection',
				'inputs' : [{
					'name' : 'host',
					'title' : 'Host',
					'placeholder' : this.settings.get('host') || 'localhost'
				},{
					'name' : 'port',
					'type' : 'number',
					'title' : 'Port',
					'placeholder' : this.settings.get('port') || 6232
				}]
			}
		}
	
		var About = {
			'title' : 'About Vibe (Version ' + this.settings.get('version') + ')',
			'navTitle' : 'About Vibe',
			'body' : '<img src="images/icon.png" style="float:left" alt /><p>Vibe is a Web Application for streaming music. Just enter the Url of your Vibe Server and you\'re ready to go.</p><p>Vibe is an open source project that is written entirely in Javascript, and can be found on GitHub <a href="https://github.com/TheFuzzball/MusicMe-WebApp">here</a>.</p><p>Vibe will run in most Web Browsers (IE8+, Chrome, FireFox 3.5+), but is best enjoyed in a modern W3C-standard browser.',
			'alignment' : 'justify'
		};
	
		// modal dialogue definition.
		MDD = {
			'title' : 'Settings',
			'views' : [UIView, ConnectionView, About],
			'buttons' : {
				'Apply' : commitSettings,
				'Close' : true
			},
			'animateIn' : 'slideTop'
		};
	
	}

	Settings.prototype.show = function() {
	
		dialogue.createMultiView(MDD);
	
	}

	Settings.prototype.firstrun = function(callback, title, body) {
	
		var self = this;
	
		var MDD = {
			'title' : title || "Welcome to Vibe!",
			'body' : body || "<p>Before you can use Vibe, the address of your Vibe Server must be specified.</p><p>You can find the address of your Vibe Server by looking in its main window, where the address will be specified in the format of: hostname:portnumber.</p>",
			'buttons' : { 'Go' : function(){
				
				var host = document.forms['firstrun']['host'].value || document.forms['firstrun']['host'].placeholder
				var port = document.forms['firstrun']['port'].value || document.forms['firstrun']['port'].placeholder;
				
				self.settings.set('host',host);
				self.settings.set('port',port);
			
				callback.call(this,host,port);
			
				this.close();
			
			} },
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
				}]
			}
		}
	
		dialogue.createSingle(MDD);
	
	}

	return Settings;

});