/**
 * MusicMe
 * @description Official MusicMe Web App.
 */
require(['modules/domReady','modules/settings','modules/EventEmitter','modules/modalDialogue/modal'], function (domReady,Settings,EventEmitter,ModalDialogue) {

	domReady(function(){
		
		// make a global EventEmitter object.
		window.ee = new EventEmitter();
		
		// make a global settings object.
		window.settings = new Settings();
		
		var dialogueWizard = document.getElementById('dialogueWizard');
		
		addListener(dialogueWizard,'click',function(){
		
			var dialogue = new ModalDialogue();
			
			dialogue.createWizard([{
				"title" : "Welcome to MusicMe.",
				"body" : "<p>It looks like this is your first time using MusicMe, before you can get started you'll need to specify the MusicMe server host and port. If your MusicMe is configured for authentication, tick the authentication box and enter your username and password.</p>",
				"form" : {
					"name" : "mm_settings",
					"inputs" : [{
						"title" : "Host:",
						"name" : "host"
					},{
						"title" : "Port:",
						"name" : "port"
					}]
				},
				"buttons" : {next:true}
			},{
				"title" : "Set Up The Interface",
				"form" : {
					"name" : "i_settings",
					"inputs" : [{
						"title" : "Default Volume",
						"name" : "volume",
						"type" : "number",
						"default" : 100
					}]
				},
				"buttons" : {prev:true,Begin:function(){
					
					this.destroy();
					
				}}
			}]);
		
		});
		
	});

});