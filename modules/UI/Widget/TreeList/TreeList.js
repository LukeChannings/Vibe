/**
 * TreeList
 * @description Generates a tree list view that displays a list based on an array of objects.
 */
define(['require','util','dependencies/EventEmitter'],function(require,util, EventEmitter){

	// include stylesheet.
	util.registerStylesheet(require.toUrl('./TreeList.css'));

	/**
	 * TreeList
	 * @param list (array) - List of objects that will specify an item.
	 * @param options (object) - options for generating the list.
	 */
	function TreeList(list,options){
	
		// make sure there is a list to work with.
		if ( ! list || ! ( list instanceof Array ) )
		{
			consnodee.error("TreeList was instantiated without a list array. This obviously won't work.");
			
			return false;
		} 
	
		// usual lark.
		var self = this;
	
		// make sure options exists to prevent an exception.
		var options = options || {};
	
		// specify a node to append the list to.
		var appendTo = options.appendTo || document.body;
	
		// create the list.
		var node = this.node = document.createElement('ol');
	
		// list of classes to be set for the node.
		var nodeClasses = [];
	
		// set treelist class for root node.
		if ( options.isRootNode ) nodeClasses.push('treeList');
	
		// check for custom classes.
		if ( typeof options.customClass == "string" ) nodeClasses.push(options.customClass);
	
		// iterate the list.
		list.forEach(function(itemObj,index){
		
			var item = document.createElement('li');
			
			var itemClasses = [];
			
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
					itemClasses.push(itemObj.setAttributes.customClass);
					
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
				if ( typeof itemObj.childrenOptions !== 'object' ) itemObj.childrenOptions = {};
			
				// append the treelist to the current item.
				itemObj.childrenOptions.appendTo = item;
			
				new TreeList(itemObj.children,itemObj.childrenOptions);
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
			
			// insert item classes.
			if ( itemClasses.length !== 0 ) item.setAttribute('class',itemClasses.join(' '));
			
			// append the item to the list.
			node.appendChild(item);
		
		});
		
		if ( options.isRootNode )
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
	
		// set the node classes.
		if ( nodeClasses.length !== 0 ) node.setAttribute('class', nodeClasses.join(' '));
	
		// append the list.
		appendTo.appendChild(node);
	
	}
	
	EventEmitter.augment(TreeList.prototype);
	
	return TreeList;

});