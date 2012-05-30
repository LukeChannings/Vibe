define(['util', 'UI/Widget/DragAndDrop/DragAndDrop'], function(util, DnD) {

	var RearrangeableList = function(options) {
	
		this.node = options.node || util.createElement({
			'tag' : 'div',
			'appendTo' : options.appendTo || document.body
		})
	}

	RearrangeableList.prototype.render = function(items) {
	
		var self = this
	
		items.forEach(function(item) {
		
			var node = util.createElement({
				tag : 'li',
				appendTo : self.node,
				inner : item
			})
			
			DnD.draggable({
				node : node,
				dropZone : 'list',
				start : function() {
				
					console.log('starting..')
				}
			})
			
			DnD.droppable({
				node : node,
				zoneClass : 'draghighlight',
				zoneHighlightNode : node,
				dropZone : 'list',
				enter : function() {
				
					console.log('over.')	
				},
				drop : function() {
				
					console.log('drop.')
				}
			})
		})
	}

	RearrangeableList.prototype.redraw = function() {}

	/**
	 * moves an item, or a set of items in the list to an index.
	 * @param from {number|array} index of the item to move, or an array representing a range.
	 * @param to {number} the index of the item after which the items will be moved.
	 */
	RearrangeableList.prototype.rearrange = function(from, to) {
	
		
	}

	return RearrangeableList
})