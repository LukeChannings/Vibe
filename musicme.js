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
		
		var dialogue = new ModalDialogue();
		
		dialogue.createDialogue({
			"title" : "Welcome to MusicMe",
			"body" : "Before we can get started some basic information about your MusicMe server is required.",
			"alignment" : "justify",
			"form" : {
				"name" : "getting_started",
				"inputs" : [{
					"name" : "host",
					"title" : "Host",
					"placeholder" : "localhost"
				},{
					"name" : "port",
					"title" : "Port",
					"placeholder" : 6232,
					"type" : "number"
				}]
			},
			"buttons" : {"Begin" : function(){
				
				alert("Doing something, bbk l8r.");
				
			}}
		});
		
	});

});