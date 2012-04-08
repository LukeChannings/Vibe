#TreeList#

The TreeList widget generates a specific type of element structure specifically for
representing a hierarchical data structure.

##Usage:##

Below is an example usage for a TreeList when representing a list of items.

	require(['UI/Widget/TreeList/TreeList'],function(TreeList){
	
		// a list of items to generate.
		var items = [{'name' : "Item 1"},{'name' : "Item 2",'name' : 'Item 3'},{'name' : "Item 4"}];
	
		// make a tree list.
		var list = new TreeList(items);
	
	});

TreeList also has support for specifying options as a second parameter. These options are
specified as an object literal, and are documented below. Here is an example:

	require(['UI/Widget/TreeList/TreeList'],function(TreeList){
	
		// a list of items to generate.
		var items = [{'name' : "Item 1"},{'name' : "Item 2",'name' : 'Item 3'},{'name' : "Item 4"}];
	
		// make a tree list.
		var list = new TreeList(items,{
			'appendTo' : document.getElementById('someElement'),
			'setAttributes' : {
				'title' : 'This attribute is set on all items.'
			}
		});
	
	});

##Options:##

The options are specified using a object notation, the possible properties are documented below.

###option.appendTo###

If appendTo is specified and is an HTMLElement then the TreeList will be appended to that element. By default
the TreeList is appended to document.body.

###option.customClass###

If customClass is specified and is a string then the string will be appended to the class attribute of the 
generated TreeList.

###option.setAttributes###

If setAttributes is specified and is either an object or an array then each attribute specified will be 
set on each __item__ within the TreeList.

Attributes can either be an array of two-element arrays, where arr[0] is the key and arr[1] is the value, 
or an object where the property is the key and the property value is the attribute value.

##Events:##

A TreeView can emit only two events:

###itemClicked###

itemClicked is emitted when a TreeList item is clicked, and the event is emitted with the target HTMLElement
and a boolean isPopulated value (true if data-populated is an attribute on the item.) isPopulated is used
for determining if the item has child items, and if they have been fetched from the Api. It is used to prevent
duplication if Api calls.

###itemDoubleClicked###

itemDoubleClicked is emitted when a TreeList item is clicked twice within the space of 270ms, or an otherwise 
arbitrary value specified in settings->clickTimeout. The event is emitted with the target HTMLElement.