/**
 * UITreeListWidget
 * @description Generates a tree list view that displays a list based on an array of objects.
 */
define(['require','util','dependencies/EventEmitter'],function(require, util, EventEmitter){

	// include stylesheet.
	util.registerStylesheet(require.toUrl('./TreeList.css'));

	/**
	 * TreeList
	 * @param list (array) - List of objects that will specify an item.
	 * @param options (object) - options for generating the list.
	 */
	var UITreeListWidget = function(list,options){
	
		// make sure there is a list to work with.
		if ( ! list || ! ( list instanceof Array ) )
		{
			console.error("TreeList was instantiated without a list array. This obviously won't work.");
			
			return false;
		} 
	
		// usual lark.
		var self = this;
	
		// make sure options exists to prevent an exception.
		var options = options || {};
	
		// specify a node to append the list to.
		var appendTo = options.appendTo || document.body;
	
		// create the list.
		var node = this.node = util.createElement({
			'tag' : 'ol'
		});
	
		// set treelist class for root node.
		if ( options.isRootNode ) node.addClass('UITreeListWidget');
	
		if ( options.isFinalNode ) node.addClass('finalNode');
	
		// check for custom classes.
		if ( typeof options.customClass == "string" ) node.addClass(options.customClass);
	
		// iterate the list.
		list.forEach(function(itemObj,index){
		
			var item = document.createElement('li');
			
			var itemInner = util.htmlEntities(itemObj.name || itemObj.title || 'Item ' + index)
			
			if ( options.wrapItemsIn instanceof Array && options.wrapItemsIn.length == 2 )
			{
				if ( options.wrapItemsIn[0] && options.wrapItemsIn[1] )
				{
					itemInner = options.wrapItemsIn[0] + itemInner + options.wrapItemsIn[1];
				}
			}
			
			// give the item a title.
			item.innerHTML = itemInner;
		
			// set attributes specified in the item definition.
			if ( typeof itemObj.setAttributes == 'object' )
			{
			
				// check for a customClass within setAttributes.
				if ( itemObj.setAttributes.hasOwnProperty('customClass') )
				{
					// add the class to the class list.
					item.addClass(itemObj.setAttributes.customClass);
					
					// remove it from the setAttributes object before setting attributes.
					delete itemObj.setAttributes.customClass;
				}
			
				// set attributes.
				item.setAttributes(itemObj.setAttributes);
			}
		
			// set attributes specified by options.
			if ( typeof options.setAttributes == 'object' ) item.setAttributes(options.setAttributes);
		
			// set data-id.
			if ( typeof itemObj.id == 'string' ) item.setAttribute('data-id',itemObj.id);
			
			// check for item children.
			if ( itemObj.children instanceof Array )
			{
			
				// if there are no children options...
				if ( typeof itemObj.options !== 'object' ) itemObj.options = {};
			
				if ( itemObj.options.isExpanded ) item.addClass('expanded');
			
				// append the treelist to the current item.
				itemObj.options.appendTo = item;
			
				new UITreeListWidget(itemObj.children,itemObj.options);
			}

			// if there is a drag start method specified bind it to the dragstart event.
			if ( typeof options.dragStartMethod == 'function' && options.isRootNode ) 
			{
				util.addListener(item,'dragstart',options.dragStartMethod);
			
			}
			
			util.addListener(item,'selectstart',function(e){
			
				if ( e.preventDefault ) e.preventDefault();
			
				if ( typeof options.dragStartMethod == 'function' && options.isRootNode )
				{
					(e.target || e.srcElement).dragDrop();
				}
			
				return false;
				
			});
			
			// append the item to the list.
			node.appendChild(item);
		
		});
		
		if ( options.isRootListener )
		{
			util.doubleClick(node,function(target){
			
				if ( target instanceof HTMLLIElement )
				{
					var isPopulated = !! target.getAttribute('data-populated');

					target.toggleClass('expanded');

					// emit the clicked event and send the target element.
					self.emit('itemClicked', target, isPopulated);

				}
			
			},function(target){
			
				self.emit('itemDoubleClicked',target);
			
			});
		}
	
		if ( ! options.isRootNode )
		{
			
			appendTo.setAttribute('data-populated','yes');
			
		}
	
		// append the list.
		appendTo.appendChild(node);
	
	}
	
	EventEmitter.augment(UITreeListWidget.prototype);
	
	return UITreeListWidget;

});