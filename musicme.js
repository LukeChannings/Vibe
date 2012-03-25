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
			"title" : "Failed To Connect.",
			"body" : "<p>It looks like you did something wrong, because I can't connect!</p>",
			"alignment" : "center",
			"errorDialogue" : true,
			"form" : {
				"name" : "settings",
				"inputs" : [{
					"name" : "host",
					"title" : "Host",
					"placeholder" : "localhost"
				},{
					"name" : "port",
					"title" : "Port",
					"placeholder" : 6232
				}]
			},
			"buttons" : {
				"Try Again." : function(){
					alert("NO! YOU DID IT WRONG!");
				}
			}
		});
		
	});

});