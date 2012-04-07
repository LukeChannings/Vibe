# ModalDialogue #

ModalDialogue is a module that allows the creation of complex modal dialogues using a
Modal Dialogue Definition (MDD).

## Support ##

ModalDialogue is tested on FireFox 10+, Chrome 15+ and IE9. IE9 doesn't support linear
gradients so some things may be slightly different. (Don't blame me, blame Microsoft.)

## Usage: ##

To use ModalDialogue you create an instance like so:

	var dialogue = new ModalDialogue();

This will create an overlay element and append it to the body. It will be hidden until 
you use one of the methods to create a dialogue.

## ModalDialogue.createDialogue ##

This method allows the creation of a simple dialogue. Pass it an MDD (documented below) and
it will create a dialogue for you.

Example:

	dialogue.createDialogue(MDD);

## ModalDialogue.createWizard ##

This method creates a dialogue that looks like the simple createDialogue, except that it allows
you to specify multiple dialogue objects which can be used in a wizard-like fashion. createWizard
takes an array of MDD objects.

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

## ModalDialogue.createViewBasedDialogue ##

createViewBasedDialogue will create a complex view-based dialogue that provides a navigation sidebar and a 
main view area. The navigation area allows you to switch between views. Each view is defined as a standard MDD,
with the addition of a __navTitle__ member, which sets the title in the navigation. (If unspecified, the navigation 
title defaults to the view title.)

The dialogue object is passed a title, which is used in the sidebar.

Buttons are not specified on a per-view basis, instead buttons are specified within the dialogue definition, and 
the standard close button is available as a template. Views are specified in the __views__ member, which is an array.

Example:

	dialogue.createDialogueWithSidebar({
		"title" : "Sidebar Title.",
		"views" : [MDD,MDD,MDD,etc],
		"buttons" : {close:true}
	});

## MDD ##

The Modal Dialogue Definition is used for defining a modal dialogue or modal view.

### MDD.title ###

The title creates a default h1 and puts the contents in the dialogue.

### MDD.body ###

The body member accepts two types of data: __HTMLElement__ and __String__. MDD.body can 
also be an array of HTMLElements or strings, or a mixture of the two.

Example:

	var h2 = document.createElement("h2");

	h2.innerText = "This is a subheader.";

	dialogue.createDialogue({
		"title" : "Hello World",
		"body" : [h2,"<p>This is a paragraph</p>","<img src='image.jpg' alt />",]
	});

### MDD.buttons ###

The buttons object allows you to specify a button, or a series of buttons to add 
to the dialogue. There are two properties for buttons: __Name__ and __Callback__.

Example:

	dialogue.createDialogue({
		"This is a button" : function callback(){
		
			// this is a callback.
		
			// close the dialogue with...
			this.destroy();
		}
	});

As you can see from the example above, calling __this.destroy__ will close the dialogue.

### MDD.form ###

The form object has two properties: __name__ and __inputs__, the name property
is a string that will be used to refer to the form in the callbacks. The inputs
property is an array that contains objects that define an input.

An input object allows the following properties:

- __title__ - If the title property is set it will put the value into a label 
and the input element into the label.

- __type__ - The input type. Defaults to text.

- __name__ - The input name.

- __placeholder__ - The placeholder value. Disappears when clicked, used as a default.

- __options__ - When the type is "select", options is accepted as an array of options.

Example:

	dialogue.createDialogue({
		"title" : "Example",
		"body" : "Here's a form:",
		"form" : {
			"name" : "myForm",
			"inputs" : [{
				"title" : "Type text here: ",
				"name" : "textField"
			},{
				"title" : "Type a number here:",
				"name" : "numberField",
				"type" : "number"
			}]
		}
	})

The above example will create a simple form with two inputs. To access the values of these
forms, use __document.forms["myForm"]["textField"]__ and __document.forms["myForm"]["numberField"]__.

### MDD.customClass ###

Add custom classes to the dialogue element. Accepts a single class or an array
of classes.

Example:

	dialogue.createDialogue({
		"title" : "Hello!",
		"body" : "Hello world.",
		"customClass" : ["someClass","someOtherClass"]	
	});

### MDD.alignment ###

Defaults to left, accepts __center__, __justify__ and __right__. (Changes the text-align property.)

### MDD.errorDialogue ###

Adds an error background image.
