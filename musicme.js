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
		
		var simpleDialogue = document.getElementById("simpleDialogue");
		
		addListener(simpleDialogue,'click',function(){
		
			var dialogue = new ModalDialogue();
			
			dialogue.createDialogue({
				"title" : "This is a simple dialogue.",
				"alignment" : "center",
				"buttons" : {close:true}
			});
		
		});
		
		var dialogueWizard = document.getElementById('dialogueWizard');
		
		addListener(dialogueWizard,'click',function(){
		
			var dialogue = new ModalDialogue();
			
			dialogue.createWizard([{
				"title" : "Pane one.",
				"buttons" : {next:true}
			},{
				"title" : "Pane two.",
				"buttons" : {prev:true,next:true}
			},{
				"title" : "Pane three.",
				"buttons" : {prev:true,close:true}
			}]);
		
		});
		
	});

});