#TextInputWidget#

The TextInput widget is a polyfill type widget that creates an HTML5-style
search input. A TextInput will create a clear button when you start typing,
and make it go away when there is no text in the field.

TextInput also fixes placeholder functionality allowing for browsers that don't
yet have a working implementation of placeholders to be consistent with other browsers.

##Usage:##

To use a TextInputWidget import it using require.js as shown in the example below:

	require(['UI/Widget/TextInput/TextInput'],function(TextInput){
	
		var textinput = new TextInput();
	
	});

##Options:##

###option.appendTo###

appendTo must be an HTMLElement, and if it's detected the TextInput will be appended to this element.
If there is no appendTo element then the TextInput will be appended to document.body by default.

###option.placeholder###

The placeholder property must be a string, and if detected it will be used as the placeholder text for
the TextInput. Placeholder text disappears when the input is clicked, and reappears when the input is
clicked out of and the input is still blank.

##Events:##

###focus###

The focus event is emitted when the input is clicked on.

###blur###

The blur event is emitted when the input is clicked out of.

###input###

The input event is emitted when a character is typed into the TextInput. The event is emitted with two 
parameters: __value__ and __key__. The value is the current value of the TextInput, and key is the key
that has just been inputted.

###clear###

The clear event is emitted when either the clear button is pressed (causing the input to be cleared,)
or the input is otherwise cleared using the backspace key.