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
			
		dialogue.createDialogueWithSidebar({
			"title" : "Settings",
			"views" : [{
				"title" : "Interface Preferences",
				"body" : "<p>This pane will allow for configuration of the MusicMe Interface.</p>",
				"form" : {
					"name" : "interface_settings",
					"inputs" : [{
						"title" : "Host: ",
						"name" : "host",
						"placeholder" : "localhost"
					},{
						"title" : "Port: ",
						"name" : "port",
						"type" : "number",
						"placeholder" : "6242"
					}]
				}
			},{
				"title" : "Album Art Manager",
				"body" : "<p>Support for managing Album art will be added at some point.</p>"
			}],
			"buttons" : {
				"close" : true
			}
		});
		
	});

});