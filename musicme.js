/**
 * MusicMe
 * @description Official MusicMe Web App.
 */
 
require.config({baseUrl: "./modules/"});

require(['domReady','settings','EventEmitter','ModalDialogue/modalDialogue'], function (domReady,Settings,EventEmitter,MD) {

	domReady(function(){
		
		// make a global EventEmitter object.
		ee = new EventEmitter();
		
		// make a global settings object.
		settings = new Settings();

		modal = MD;

		modal.createWizard([{
				"title" : "This is the first pane of the wizard!",
				"body" : "Don't like the first pane? Why not go to the second one? Just press the next button.",
				"buttons" : {next:true}
			},{
				"title" : "This is the second pane!",
				"body" : "Don't like the second pane? Why are you so hard to please?! You want another dialogue? Is that is? FINE!",
				"buttons" : {prev:true,next:true}
			},{
				"title" : "LAST DIALOGUE!",
				"body" : "If you're not happy with this one it's your own fault! Make your own dialogue then!",
				"buttons" : {prev:true,close:true}
		}],"slideTop");

	});

});