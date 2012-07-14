/**
 * Generates a tree list view that displays a list based on an array of objects.
 */
define(function(require) {

	var util = require('util'),
		DnD = require('dom.dragAndDrop')

	// include stylesheet.
	util.registerStylesheet('./stylesheets/ui.widget.treeList.css')

	/**
	 * TreeList
	 * @param list (array) - List of objects that will specify an item.
	 * @param options (object) - options for generating the list.
	 */
	var UITreeListWidget = function(list, options, clickTimeout) {
	
		// make sure there is a list to work with.
		if ( ! list || ! list instanceof Array ) {
		
			console.error("TreeList was instantiated without a list array. This obviously won't work.")
			
			return false
		}
		
		var self = this, // usual lark.
			options = options || {}, // make sure options exists to prevent an exception.
			appendTo = options.appendTo || document.body, // specify a node to append the list to
			node = this.node = util.createElement({'tag' : 'ol'}) // treelist node.
		
		options.clickTimeout = clickTimeout

		// set treelist class for root node.
		if ( options.isRootNode ) {
			util.addClass(node, 'UITreeListWidget')
		}
	
		if ( options.isFinalNode ) {
			util.addClass(node, 'finalNode')
		}
	
		// check for custom classes.
		if ( typeof options.customClass == "string" ) {
			util.addClass(node, options.customClass)
		}
	
		// iterate the list.
		util.forEach(list, function(itemObj, index) {
		
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
					util.addClass(item, itemObj.setAttributes.customClass)
					
					// remove it from the setAttributes object before setting attributes.
					delete itemObj.setAttributes.customClass
				}
			
				// set attributes.
				util.setAttributes(item, itemObj.setAttributes)
			}
		
			// set attributes specified by options.
			if ( typeof options.setAttributes == 'object' ) {
				util.setAttributes(item, options.setAttributes)
			}
		
			// set data-id.
			if ( typeof itemObj.id == 'string' ) {
				item.setAttribute('data-id', itemObj.id)
			}
			
			// check for item children.
			if ( itemObj.children instanceof Array ) {
			
				// if there are no children options...
				if ( typeof itemObj.options !== 'object' ) itemObj.options = {}
			
				if ( itemObj.options.isExpanded ) {
					util.addClass(item, 'expanded')
				}
			
				// append the treelist to the current item.
				itemObj.options.appendTo = item
			
				new UITreeListWidget(itemObj.children,itemObj.options)
			}

			// if there is a drag start method specified bind it to the dragstart event.
			if ( typeof options.dragStart == 'function' && options.isRootNode ) {

				DnD.draggable({
					node : item,
					dropZone : 'collection_playlist',
					start : options.dragStart
				})
			}
			
			// append the item to the list.
			node.appendChild(item)
		
		})
		
		if ( options.isRootListener ) {
		
			util.doubleClick(node,function(target) {
			
				if ( target instanceof HTMLLIElement ) {
				
					var isPopulated = !! target.getAttribute('data-populated')

					if ( util.hasClass(target.parentNode, 'finalNode') ) {
						isPopulated = true
					} else {
						util.toggleClass(target, 'expanded')
					}
					
					// emit the clicked event and send the target element.
					if ( typeof options.onclick == 'function' ) {
						options.onclick(target, isPopulated)
					}
				}
			
			}, function(target) {
			
				if ( typeof options.ondblclick == 'function') {
					options.ondblclick(target)
				}
			
			}, options.clickTimeout)
		}
	
		if ( ! options.isRootNode ) {
			
			appendTo.setAttribute('data-populated','yes')
		}
	
		// append the list.
		appendTo.appendChild(node)
	}
	
	return UITreeListWidget
})