define(['require', 'util', 'UI/Widget/DragAndDrop/DragAndDrop'], function(require, util, DnD) {

	util.registerStylesheet(require.toUrl('./RearrangeableList.css'))

	/**
	 * creates a rearrangeable list instance.
	 * @param options {object literal} options with which to configure the instance.
	 * @param options.appendTo {Element} HTML node to append the list node to.
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
				start : function() {
				
					return Array.prototype.indexOf.call(self.node.childNodes, item)
				}
			})
			
			// make droppable.
			DnD.droppable({
				node : item,
				whileentered : function(target, e) {
				
					dragWhileEntered.call(self, target, e)
				},
				leave : function(target) {
				
					dragLeave()
				},
				drop : function(target, e, index) {
				
					dragDrop.call(self, item, index)
				}
			})
		
			// append the node to the list.
			self.node.appendChild(item)
		})
	}

	/**
	 * moves the node(s) associated with the dragstart event to the drop target.
	 * @param item {Element} the item to move the selected node to.
	 * @param index {number} index of the selected node.
	 */
	function dragDrop(item, index) {
	
		document.getElementById('dropIndicator').removeNode()
		
		var group,
			draggedNode = this.node.childNodes[index]
		
		if ( draggedNode.hasClass('selected') ) {
		
			group = this.selectedNodes
		}
		else {
		
			group = [draggedNode]
		}
		
		moveTo.call(this, group, item, window.dropRegion)
		
		window.dropRegion = undefined
	}
	 
	/**
	 * updates the drag indicator based on the position of the cursor within the current list item.
	 * @param item {Element} target html element.
	 * @param e {Event} the dragover event.
	 */
	function dragWhileEntered(item, e) {
	
		clearTimeout(window.dropLeaveTimeout)
				
		if ( item instanceof HTMLLIElement ) {
	
			var region = window.dropRegion = cursorRegion(item, e),
				indicator = document.getElementById('dropIndicator'),
				index = Array.prototype.indexOf.call(this.node.childNodes, item)
			
			if ( !indicator ) {
			
				var indicator = util.createElement({
					tag : 'div',
					id : 'dropIndicator',
					appendTo : this.node
				})
			}
			
			if ( region == 'top' ) indicator.style.top = (index * 25) + 'px'

			else indicator.style.top = ((index * 25) + 25) + 'px'
		}
	}

	/**
	 * cleans up the drop target indicator.
	 */
	function dragLeave() {
	
		window.dropLeaveTimeout = window.setTimeout(function() {
		
			var indicator = document.getElementById('dropIndicator')
		
			if ( indicator ) indicator.removeNode()
		}, 100)
	}

	/**
	 * moves a node or a series of nodes to before or after a given node.
	 * @param group {array} list of nodes to be moved.
	 * @param moveTo {Element} node to be used as an insertion reference.
	 * @param direction {string} top or bottom, to insert above or below the reference node.
	 */
	function moveTo(group, moveTo, direction) {
	
		if ( direction == 'bottom' ) {
	
			for ( var i = group.length - 1; i >= 0; i-- ) {
			
				this.node.insertBefore(group[i], moveTo.nextSibling)
			}
		}
		else {
		
			for ( var i = 0; i < group.length; i++ ) {
				
				this.node.insertBefore(group[i], moveTo)
			}
		}
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
				var range = [selectedIndex, clickedIndex].sort(function(a, b) { return a - b })

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
		for ( var i = clickedIndex; i >= 0; i-- ) {
		
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
		
		distance -= _node.parentNode.parentNode.parentNode.scrollTop
		
		var range = [distance, distance + ( _node.offsetHeight / 2 ) ]
		
		if ( e.clientY >= range[0] && e.clientY <= range[1]  ) return 'top'
		
		else return 'bottom'
	}

	return RearrangeableList
})