define(['require', 'util', 'UI/Widget/DragAndDrop/DragAndDrop'], function(require, util, DnD) {

	util.registerStylesheet(require.toUrl('./RearrangeableList.css'))

	/**
	 * creates a rearrangeable list instance.
	 * @param options {object literal} options with which to configure the instance.
	 * @param options.appendTo {Element} HTML node to append the list node to.
	 * @param options.insertBorderStyle {string} style of the insert indicator.
	 */
	var RearrangeableList = function(options) {
	
		// rearrangeable list node.
		this.node = util.createElement({
			tag : 'ol',
			customClass : 'UIRearrangeableListWidget',
			appendTo : (options.appendTo instanceof Element) ? options.appendTo : document.body
		})
		
		// add selection support.
		selectionify.call(this, this.node)
		
		// set the drop indicator style.
		this.dropIndicator = ( typeof options.dropIndicator == 'string' ) ? options.dropIndicator : '2px solid #333'
		
		// list of selected nodes.
		this.selectedNodes = []
	}

	/**
	 * adds an array of HTMLLIElement nodes to the list, turning them into ListItems.
	 * @param nodes {array} list of nodes to add.
	 */
	RearrangeableList.prototype.addNodes = function(items) {
	
		var self = this
	
		items.forEach(function(item) {
		
			// make draggable.
			DnD.draggable({
				node : item,
				start : function() {}
			})
			
			// make droppable.
			DnD.droppable({
				node : item,
				whileentered : function() {},
				leave : function() {},
				drop : function() {}
			})
		
			// append the node to the list.
			self.node.appendChild(item)
		})
	}

	/**
	 * adds selection functionality to a node.
	 * @param node {Element} to add selection functionality to.
	 */
	function selectionify(node) {
	
		var self = this
	
		util.addListener(node, 'click', function(e) {
		
			var node = e.target || e.srcElement,
				clickedIndex = Array.prototype.indexOf.call(self.node.childNodes, node),
				selectedIndex = closestIndex(node, 'selected')
		
			// group select.
			if ( e.shiftKey && selectedIndex !== -1 ) {
			
				// get the indexes of the clicked node and the closest selected node.
				var range = [selectedIndex, clickedIndex].sort()

				// select all items in the range.
				for ( var i = range[0]; i <= range[1]; i++ ) {
				
					self.node.childNodes[i].addClass('selected')
					
					if ( (self.selectedNodes.indexOf(self.node.childNodes[i])) === -1 ) {
						
						self.selectedNodes.push(self.node.childNodes[i])
					}
				}
			}
			
			// select an item.
			else {
			
				// add item to selection.
				if ( !( e.metaKey || e.ctrlKey ) ) clearSelectedItems.call(self)
			
				if ( !node.hasClass('selected') ) {
				
					self.selectedNodes.push(node)
					
					node.addClass('selected')
				}
				
				else if ( node.hasClass('selected') && (e.metaKey || e.ctrlKey) ) {
				
					node.removeClass('selected')
					
					self.selectedNodes.splice(self.selectedNodes.indexOf(node), 1)
				}
			}
		})
	}

	/**
	 * returns the index of the closest node with a given class name. If no node is found, defaults to -1.
	 * @param node {Element} to find the nearest index for.
	 * @param className {string} the index of the item that matches this class name first is returned.
	 */
	function closestIndex(node, className) {
	
		var list = node.parentNode,
			clickedIndex = Array.prototype.indexOf.call(list.childNodes, node),
			matchedIndex = -1
			
		
		// start searching upwards.
		for ( var i = clickedIndex; i > 0; i-- ) {
		
			if ( list.childNodes[i].hasClass(className) && i !== clickedIndex ) {
			
				matchedIndex = i
				
				break
			}
		}
		
		// if nothing is found upward, start looking down.
		if ( matchedIndex == -1 ) {
		
			for ( var i = clickedIndex; i < list.childNodes.length; i++ ) {
			
				if ( list.childNodes[i].hasClass(className) && i !== clickedIndex ) {
				
					matchedIndex = i
					
					break
				}
			}
		}

		return matchedIndex
	}

	/**
	 * clears the selected nodes.
	 */
	function clearSelectedItems() {
	
		// deselect items.
		this.selectedNodes.forEach(function(node) {
		
			node.removeClass('selected')
		})
		
		// clear the selected nodes array.
		this.selectedNodes.splice(0, this.selectedNodes.length)
	}

	/**
	 * determines the area of the node that the cursor is in.
	 * @param node {Element} the target node.
	 * @param e {Event} the MouseEvent. 
	 * @returns {string} top or bottom, reflecting the cursor being in the top 50% of the node or vice versa respectively.
	 */
	function cursorRegion(node, e) {
	
		var distance = 0, _node = node
		
		do {
		
			distance += node.offsetTop
			
			node = node.offsetParent
			
		} while ( node )
		
		distance -= _node.scrollTop
		
		var range = [distance, distance + ( _node.offsetHeight / 2 ) ]
		
		if ( e.clientY >= range[0] && e.clientY <= range[1]  ) return 'top'
		
		else return 'bottom'
	}

	return RearrangeableList
})