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
				"body" : "<p>It looks like this is your first time using MusicMe, before you can get started you'll need to specify the MusicMe server host and port.<br/><br/>If your MusicMe is configured for authentication, tick the authentication box and enter your username and password.</p>",
				"form" : {
					"name" : "mm_settings",
					"inputs" : [{
						"title" : "Host:",
						"name" : "host",
						"placeholder" : "localhost"
					},{
						"title" : "Port:",
						"name" : "port",
						"placeholder" : 6232
					}]
				},
				"buttons" : {next:true}
			},{
				"title" : "Set Up The Interface",
				"body" : "<p>This section is where you can specify some basic interface settings, the defaults are fairly sane, but if you wish to override anything, then just specify your own setting. Once you're done, you can begin enjoying MusicMe!</p>",
				"form" : {
					"name" : "i_settings",
					"inputs" : [{
						"title" : "Default Volume",
						"name" : "volume",
						"type" : "number",
						"placeholder" : 80
					},
					{
						"title" : "Order By: ",
						"name" : "orderBy",
						"type" : "select",
						"options" : ["Genre > Artist > Album > Track","Artist > Album > Track", "Album > Track"],
						"placeholder" : "Artist > Album > Track"
					}]
				},
				"buttons" : {prev:true,Begin:function(){
					
					this.destroy();
					
				}}
			}]);
		
		});
		
	});

});