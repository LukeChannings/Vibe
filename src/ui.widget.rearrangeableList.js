define(function(require) {

	// dependencies.
	var util = require('util'),
		DnD = require('dom.dragAndDrop')
	
	// variables to contain the indicator node
	// and the position of the indicator in the list
	// item for use in the moveTo function.
	var dropIndicator, dropRegion, dropTarget

	// fetch the stylesheet for this module.
	util.registerStylesheet('stylesheets/ui.widget.rearrangeableList.css')

	/**
	 * creates a rearrangeable list instance.
	 * @param options {object literal} options with which to configure the instance.
	 * @param options.appendTo {Element} HTML node to append the list node to.
	 */
	var RearrangeableList = function(options) {
	
		// rearrangeable list node.
		this.node = util.createElement({
			tag : 'ol',
			className : 'UIRearrangeableListWidget',
			appendTo : (options.appendTo instanceof Element) ? options.appendTo : document.body
		})

		if ( options.onremove ) {
			this.onremove = options.onremove
		}
		
		if ( options.onbeforeremove ) {
			this.onbeforeremove = options.onbeforeremove
		}
		
		if ( options.onaftereremove ) {
			this.onaftereremove = options.onaftereremove
		}

		if ( options.onbeforemove ) {
			this.onbeforemove = options.onbeforemove
		}
		
		if ( options.onaftermove ) {
			this.onaftermove = options.onaftermove
		}
		
		// list of selected nodes.
		this.selectedNodes = []
	}

	/**
	 * adds an array of HTMLLIElement nodes to the list, turning them into ListItems.
	 * @param nodes {array} list of nodes to add.
	 * @param afterItem {Element} (optional) insert new rows after given row.
	 */
	RearrangeableList.prototype.addNodes = function(items, afterItem) {
	
		var self = this,
			rows = document.createDocumentFragment()
	
		util.forEach(
			
			// the items to add to the list.
			items,
			
			// function applied to each item.
			function(item) {
		
			// make draggable.
			DnD.draggable({
				node : item,
				dropZone : 'rearrangeablelist',
				start : function() {
				
					return Array.prototype.indexOf.call(self.node.childNodes, item)
				}
			})
			
			// make droppable.
			DnD.droppable({
				node : item,
				dropZone : 'rearrangeablelist',
				whileentered : function(target, e) {
				
					dragWhileEntered.call(self, target, e)
				},
				leave : function(target) {
				
					dragLeave()
				},
				drop : function(target, e, index) {
				
					self.dragDrop.call(self, e, item, index)
				}
			})
		
			// add selection support.
			selectionify.call(self, item)
		
			if ( afterItem && afterItem instanceof Element ) {
				afterItem.parentNode.insertBefore(item, afterItem)
			} else {
				
				// append the node to the list.
				rows.appendChild(item)
			}
		},
			
			// function called when all items have been iterated.
			function() {
				self.node.appendChild(rows)
			}
		)
	}

	/**
	 * removes a group of items from the list by their index in the list.
	 * @param group {array} list of indexes.
	 */
	RearrangeableList.prototype.removeNodesByIndex = function(group) {
	
		if ( util.isArray(group) && /^\d+$/.test(group.join('')) ) {
		
			group = group.sort(function(a,b) {
				return a + b
			})
		
			if ( this.onbeforeremove ) {
				this.onbeforeremove()
			}
		
			for ( var i = 0; i < group.length; i += 1 ) {
			
				if ( this.onremove ) {
					this.onremove(group[i])
				}
			
				util.removeNode(this.node.childNodes[group[i]])
			}
			
			if ( this.onafterremove ) {
				this.onafterremove()
			}
		}
	}

	/**
	 * removes a group of nodes from the list.
	 * @param group {array} list of item nodes.
	 */
	RearrangeableList.prototype.removeNodes = function(group) {
	
		if ( this.onbeforeremove ) {
			this.onbeforeremove()
		}
	
		for ( var i = 0; i < group.length; i += 1 ) {
		
			if ( this.onremove ) {
				this.onremove(
					Array.prototype.indexOf.call(this.node.childNodes, group[i])
				)
			}
			
			util.removeNode(group[i])
		}
		
		if ( this.onafterremove ) {
			this.onafterremove()
		}
	}

	RearrangeableList.prototype.removeChildren = function() {
	
		util.removeChildren(this.node)
	}

	/**
	 * moves the node(s) associated with the dragstart event to the drop target.
	 * @param item {Element} the item to move the selected node to.
	 * @param index {number} index of the selected node.
	 */
	RearrangeableList.prototype.dragDrop = function(e, item, index) {
	
		if ( window.dropZone == 'rearrangeablelist' ) {
		
			// an array of items to be moved.
			var group,
			
			// a reference to the node that was dropped onto the item.
			draggedNode = this.node.childNodes[index]
			
			if ( util.hasClass(draggedNode, 'selected') ) {
			
				// if the draggedNode was selected then
				// it's likely that other items were also
				// selected, so make the group equal all
				// nodes that are selected.
				group = this.selectedNodes
			} else {
			
				// if the draggedNode is not selected, then
				// create a list with only the draggedNode.
				group = [draggedNode]
			}
			
			// translate the positions of the selected
			// items into their new position before or
			// after the item they were dropped on.
			translateNodes.call(
				this,
				group,
				item,
				dropRegion
			)
			
			dropRegion = undefined
		
		} else if ( window.dropZone == 'collection_playlist' ){
		
			// set the drop target on the event for the collection drop listener.
			e.dropTarget = ( dropRegion == 'bottom' ) ? item.nextSibling : item
		}
		
		if ( dropIndicator ) {
			util.removeNode(dropIndicator)
			dropIndicator = null
		}
	}
	
	/**
	 * updates the drag indicator based on the position of the cursor within the current list item.
	 * @param item {Element} target html element.
	 * @param e {Event} the dragover event.
	 */
	function dragWhileEntered(item, e) {
		
		// get the container list item.
		item = item.parentNode.parentNode
		
		if ( item.parentNode.className == 'UIRearrangeableListWidget' ) {
	
			dropRegion = cursorRegion(item, e)
			
			if ( dropIndicator ) {
				util.removeNode(dropIndicator)
				dropIndicator = null
			}
			
			dropIndicator = util.createElement({
				tag : 'div',
				id : 'dropIndicator' + dropRegion.charAt(0).toUpperCase() + dropRegion.slice(1),
				appendTo : item
			})
		}
	}

	/**
	 * cleans up the drop target indicator.
	 */
	function dragLeave() {
	
		if ( dropIndicator ) {
			util.removeNode(dropIndicator)
			dropIndicator = null
		}
	}

	/**
	 * moves a node or a series of nodes to before or after a given node.
	 * @param group {array} list of nodes to be moved.
	 * @param reference {Element} node to be used as an insertion reference.
	 * @param direction {string} top or bottom, to insert above or below the reference node.
	 */
	function translateNodes(group, reference, direction) {
	
		// turn the list of nodes into a list of indexes
		// that is sorted by value.
		group = util.map(group, function(item) {
			return util.indexOfNode(item)
		}).sort(function(a, b) {
			if ( a > b ) {
				return 1
			} else {
				return -1
			}
		})
		
		if ( direction == 'bottom' ) {
			reference = reference.nextSibling
		}
		
		if ( this.onbeforemove ) {
			this.onbeforemove(
				group,
				util.indexOfNode(reference)
			)
		}
		
		util.translateNodePositions(
			this.node,
			group,
			reference
		)
		
		if ( this.onaftermove ) {
			this.onaftermove()
		}
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
		
		distance -= _node.parentNode.parentNode.scrollTop
		
		var range = [distance, distance + ( _node.offsetHeight / 2 ) ]
		
		if ( e.clientY >= range[0] && e.clientY <= range[1]  ) {
			return 'top'
		} else {
			return 'bottom'
		}
	}

	/**
	 * adds selection functionality to a node.
	 * @param node {Element} to add selection functionality to.
	 */
	function selectionify(node) {
	
		var self = this
	
		util.addListener(node, 'click', function(e) {
		
			var clickedIndex = Array.prototype.indexOf.call(self.node.childNodes, node),
				selectedIndex = closestIndex(node, 'selected')
		
			// group select.
			if ( e.shiftKey && selectedIndex !== -1 ) {
			
				// get the indexes of the clicked node and the closest selected node.
				var range = [selectedIndex, clickedIndex].sort(function(a, b) {
					return a - b
				})

				// select all items in the range.
				for ( var i = range[0]; i <= range[1]; i += 1 ) {
				
					util.addClass(self.node.childNodes[i], 'selected')
					
					if ( (self.selectedNodes.indexOf(self.node.childNodes[i])) === -1 ) {
						
						self.selectedNodes.push(self.node.childNodes[i])
					}
				}
			}
			
			// select an item.
			else {
			
				// add item to selection.
				if ( !( e.metaKey || e.ctrlKey ) ) {
					clearSelectedItems.call(self)
				}
			
				if ( ! util.hasClass(node, 'selected') ) {
				
					self.selectedNodes.push(node)
					
					util.addClass(node, 'selected')
				} else if ( util.hasClass(node, 'selected') && (e.metaKey || e.ctrlKey) ) {
				
					util.removeClass(node, 'selected')
					
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
		
			if ( util.hasClass(list.childNodes[i], className) && i !== clickedIndex ) {
			
				matchedIndex = i
				
				break
			}
		}
		
		// if nothing is found upward, start looking down.
		if ( matchedIndex == -1 ) {
		
			for ( var i = clickedIndex; i < list.childNodes.length; i += 1 ) {
			
				if ( util.hasClass(list.childNodes[i], className) && i !== clickedIndex ) {
				
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
		util.forEach(this.selectedNodes, function(node) {
		
			util.removeClass(node, 'selected')
		})
		
		// clear the selected nodes array.
		this.selectedNodes.splice(0, this.selectedNodes.length)
	}

	return RearrangeableList
})