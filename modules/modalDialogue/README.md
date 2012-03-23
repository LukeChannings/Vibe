#ModalDialogue#

ModalDialogue is a module that allows the creation of complex modal dialogues using a
Modal Dialogue Object (MDO).

##Usage:##

To use ModalDialogue you create an instance like so:

	var dialogue = new ModalDialogue();

and use the createModalDialogue method to create a basic single-view dialogue.

	dialogue.createModalDialogue(MDO);

if you can a wizard with next/previous buttons use:

	dialogue.createModalDialogueWithWizard({MDO1,MDO2,MDO3,...]);

To create a fully fledged multi-view dialogue with a side panel navigation,
you can use the createDialogueWithViews method, which requires a bit more information.

	dialogue.createModalDialogueWithViews([{
		"name" : "Menu Item 1",
		"MDO" : MDO
	},{
		"name" : "Menu Item 2",
		"MDO" : MDO,
		"default" : true
	}]);

The default parameter above means that the view is created and shows the
second view when it's made.

##MDO##

The Modal Dialogue Object is used for defining a modal dialogue or modal view.

##MDO.title##

The title creates a default h1 and puts the contents in the dialogue.

##MDO.body##

The body member accepts two types of data: __HTMLElement__ and __String__. MDO.body can 
also be an array of HTMLElements or strings, or a mixture of the two.

Example:

	var h2 = document.createElement("h2");

	h2.innerText = "This is a subheader.";

	dialogue.createModalDialogue({
		"title" : "Hello World",
		"body" : [h2,"<p>This is a paragraph</p>","<img src='image.jpg' alt />",]
	});

##MDO.buttons##

The buttons object allows you to specify a button, or a series of buttons to add 
to the dialogue. There are two properties for buttons: __Name__ and __Callback__.

Example:

	dialogue.createModalDialogue({
		"This is a button" : function callback(){
		
			// this is a callback.
		
			// close the dialogue with...
			this.destroy();
		}
	});

##MDO.form##

The form object has two properties: __name__ and __inputs__, the name property
is a string that will be used to refer to the form in the callbacks. The inputs
property is an array that contains objects that define an input.

An input object allows the following properties:
__title__ - If the title property is set it will put the value into a label 
and the input element into the label.
__type__ - The input type. Defaults to text.
__name__ - The input name.
__default__ - The default input value.

##MDO.class##

Add custom classes to the dialogue element. Accepts a single class or an array
of classes.

Example:

	dialogue.createModalDialogue({
		"title" : "Hello!",
		"body" : "Hello world.",
		"class" : ["someClass","someOtherClass"]	
	});
