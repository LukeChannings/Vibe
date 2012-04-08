#UICollection#

__dependencies: api/musicme, util, UI/Widget/TreeList, dependencies/EventEmitter__

__tested: Chrome 15+, FireFox 3.5+, IE8+__

UICollection provides a module for constructing an element that allows the user
to interact with the MusicMe collection of the server specified in settings.

The element will be constructed by default to insert itself into document.body and
display a tree-style list of all artists in the collection, cascading to tracks. The
user will be able to click an artist, for example, and the tree list will expand to 
list all albums that belong to that artist.

##Usage:##

Import UICollection using require.js like so:

	require(['UI/Collection/Collection'],function(UICollection){
	
		// make a new UICollection instance.
		var collection = new UICollection();
	
		// listen for an item to be selected.
		collection.on('itemSelected',function(itemObj){
			
			console.log(itemObj);
			
		});
	
	});

##Options:##

UICollection accepts a set of standard options that are taken upon instantiation. The
options are accepted as an object literal.

###option.appendTo###

appendTo must be an HTMLElement, and if detected UICollection will be appended to this element.
If there is no appendTo element then UICollection will be appended to document.body by default.

###option.rootType###

The root type specifies the type of item to list at the top of the tree list hierarchy. If can be
any of the following types: __genre__, __artist__, __album__ or __track__.

By default the type is __artist__.

###option.dropTarget###

The dropTarget specifies an element that the UICollection items can be dropped onto. dropTarget
must be an HTMLElement if specified it will have all the drag and drop events (__dragover__,__dragenter__,
__dragleave__,__drop__) bound to it. Upon drop, the __itemAdded__ event will be emitted within UICollection,
the same event that is emitted during double-click of UICollection items or the single-click of the a track item.

When dropTarget is set each UICollection item has the draggable='true' attribute set, as well as the dragstart event
bound to each item.

If data is dropped from outside of the browser (e.g. an image) into the dropTarget element, the __dataDrop__ event
will be emitted.

##Events:##

###error###

The error event is emitted when the UICollection instance fails to connect to the Api. Obvious causes are incorrect
missing settings: __host__ and __port__, otherwise check your internet connection.

###itemSelected###

The itemSelected event is emitted when a UICollection item is double-clicked, a track item is single-clicked, or an item 
is dropped into the dropTarget (if it is set.) The event is emitted with an item object with two properties: __type__ and __id__.

The type property stipulates the type of item, e.g. genre, artist, album or track.

The id property stipulates the unique identifier for the type of object. (Or a urlEncoded string in the case of genre.)

###dataDrop###

The dataDrop event is emitted when an object from outside the browser is dropped into the dropTarget element. (e.g. 
an image, sound, text file, etc.) The event is emitted with two properties: __type__ and __data__.

The __type__ specified the MIME type of the data, and the __data__ is the base64-encoded binary data.

__Note__: This event will not work in IE. (Maybe IE10.)