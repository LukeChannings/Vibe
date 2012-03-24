# ModalDialogue #

ModalDialogue is a module that allows the creation of complex modal dialogues using a
Modal Dialogue Object (MDO).

## Support ##

ModalDialogue is tested on FireFox 10+, Chrome 15+ and IE9. IE9 doesn't support linear
gradients so some things may be slightly different. (Don't blame me, blame Microsoft.)

## Usage: ##

To use ModalDialogue you create an instance like so:

	var dialogue = new ModalDialogue();

This will create an overlay element and append it to the body. It will be hidden until 
you use one of the methods to create a dialogue.

## ModalDialogue.createDialogue ##

This method allows the creation of a simple dialogue. Pass it an MDO (documented below) and
it will create a dialogue for you.

Example:

	dialogue.createDialogue(MDO);

## ModalDialogue.createWizard ##

This method creates a dialogue that looks like the simple createDialogue, except that it allows
you to specify multiple dialogue objects which can be used in a wizard-like fashion. createWizard
takes an array of MDO objects.

Example:

	dialogue.createWizard([{
		"title" : "Pane 1",
		"buttons" : {"next" : true}
	},{
		"title" : "Pane 2",
		"buttons" : {"next" : true,"prev" : true}
	},{
		"title" : "Pane 3",
		"buttons" : {"prev" : true,"close" : true}
	}]);

The above example will create a three-pane wizard with buttons for switching between them. Specifying
the prev and next buttons with a boolean value will cause the buttons to use the standard title and callback,
you can make your own, and the callback will be executed in the context of the dialogue.

If you're specifying your own callback, you can access the panes using __this.panes__, and the 
dialogue object with __this.wizard__.

## MDO ##

The Modal Dialogue Object is used for defining a modal dialogue or modal view.

### MDO.title ###

The title creates a default h1 and puts the contents in the dialogue.

### MDO.body ###

The body member accepts two types of data: __HTMLElement__ and __String__. MDO.body can 
also be an array of HTMLElements or strings, or a mixture of the two.

Example:

	var h2 = document.createElement("h2");

	h2.innerText = "This is a subheader.";

	dialogue.createModalDialogue({
		"title" : "Hello World",
		"body" : [h2,"&lt;p&gt;This is a paragraph&lt;/p&gt;","&lt;img src='image.jpg' alt /&gt;",]
	});

### MDO.buttons ###

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

As you can see from the example above, calling __this.destroy__ will close the dialogue.

### MDO.form ###

The form object has two properties: __name__ and __inputs__, the name property
is a string that will be used to refer to the form in the callbacks. The inputs
property is an array that contains objects that define an input.

An input object allows the following properties:

- __title__ - If the title property is set it will put the value into a label 
and the input element into the label.

- __type__ - The input type. Defaults to text.

- __name__ - The input name.

- __default__ - The default input value.

### MDO.class ###

Add custom classes to the dialogue element. Accepts a single class or an array
of classes.

Example:

	dialogue.createModalDialogue({
		"title" : "Hello!",
		"body" : "Hello world.",
		"class" : ["someClass","someOtherClass"]	
	});
