/**
 * UITreeListWidget
 * @description Generates a tree list view that displays a list based on an array of objects.
 */
define(['require','util/methods','dependencies/EventEmitter', 'Model/DragAndDrop'],function(require, util, EventEmitter, DnD){

	// include stylesheet.
	util.registerStylesheet(require.toUrl('./TreeList.css'))

	/**
	 * TreeList
	 * @param list (array) - List of objects that will specify an item.
	 * @param options (object) - options for generating the list.
	 */
	var UITreeListWidget = function(list, options, clickTimeout) {
	
		// make sure there is a list to work with.
		if ( ! list || ! ( list instanceof Array ) ) {
		
			console.error("TreeList was instantiated without a list array. This obviously won't work.")
			
			return false
		}
		
		// usual lark.
		var self = this,
			options = options || {}, // make sure options exists to prevent an exception.
			appendTo = options.appendTo || document.body, // specify a node to append the list to
			node = this.node = util.createElement({'tag' : 'ol'}) // treelist node.
		
		options.clickTimeout = clickTimeout

		// set treelist class for root node.
		if ( options.isRootNode ) node.addClass('UITreeListWidget')
	
		if ( options.isFinalNode ) node.addClass('finalNode')
	
		// check for custom classes.
		if ( typeof options.customClass == "string" ) node.addClass(options.customClass)
	
		// iterate the list.
		list.forEach(function(itemObj, index) {
		
			var item = document.createElement('li')
			
			var itemInner = util.htmlEntities(itemObj.trackname || itemObj.name || itemObj.title || 'Item ' + index)
			
			if ( options.wrapItemsIn instanceof Array && options.wrapItemsIn.length == 2 ) {
			
				if ( options.wrapItemsIn[0] && options.wrapItemsIn[1] ) {
				
					itemInner = options.wrapItemsIn[0] + itemInner + options.wrapItemsIn[1]
				}
			}
			
			// give the item a title.
			item.innerHTML = itemInner
		
			// set attributes specified in the item definition.
			if ( typeof itemObj.setAttributes == 'object' ) {
			
				// check for a customClass within setAttributes.
				if ( itemObj.setAttributes.hasOwnProperty('customClass') ) {
				
					// add the class to the class list.
					item.addClass(itemObj.setAttributes.customClass)
					
					// remove it from the setAttributes object before setting attributes.
					delete itemObj.setAttributes.customClass
				}
			
				// set attributes.
				item.setAttributes(itemObj.setAttributes)
			}
		
			// set attributes specified by options.
			if ( typeof options.setAttributes == 'object' ) item.setAttributes(options.setAttributes)
		
			// set data-id.
			if ( typeof itemObj.id == 'string' ) item.setAttribute('data-id', itemObj.id)
			
			// check for item children.
			if ( itemObj.children instanceof Array ) {
			
				// if there are no children options...
				if ( typeof itemObj.options !== 'object' ) itemObj.options = {}
			
				if ( itemObj.options.isExpanded ) item.addClass('expanded')
			
				// append the treelist to the current item.
				itemObj.options.appendTo = item
			
				new UITreeListWidget(itemObj.children,itemObj.options)
			}

			// if there is a drag start method specified bind it to the dragstart event.
			if ( typeof options.dragStartMethod == 'function' && options.isRootNode ) {
			
				DnD.draggable({
					node : item,
					dropZone : 'collection_playlist',
					start : options.dragStartMethod
				})
			}
			
			// append the item to the list.
			node.appendChild(item)
		
		})
		
		if ( options.isRootListener ) {
		
			util.doubleClick(node,function(target) {
			
				if ( target instanceof HTMLLIElement ) {
				
					var isPopulated = !! target.getAttribute('data-populated')

					if ( target.parentNode.hasClass('finalNode') ) isPopulated = true
					
					else target.toggleClass('expanded')
					
					// emit the clicked event and send the target element.
					self.emit('itemClicked', target, isPopulated)
				}
			
			}, function(target) {
			
				self.emit('itemDoubleClicked',target)
			
			}, options.clickTimeout)
		}
	
		if ( ! options.isRootNode ) {
			
			appendTo.setAttribute('data-populated','yes')
		}
	
		// append the list.
		appendTo.appendChild(node)
	
	}
	
	EventEmitter.augment(UITreeListWidget.prototype)
	
	return UITreeListWidget

})