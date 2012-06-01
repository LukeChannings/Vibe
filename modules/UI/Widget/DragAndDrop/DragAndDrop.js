define(['util'], function(util) {

	/**
	 * module to abstract binding dropzones and draggable nodes.
	 */
	var DragAndDrop = {}
	
	/**
	 * makes a node draggable
	 * @param node {Element} to be made a draggable item.
	 * @param start {function} to be called when the element begins to be dragged.
	 * @param data {string} to be set in the drag event and read on drop.
	 */
	DragAndDrop.draggable = function(options) {
	
		var options = options || {}
	
		options.node.setAttribute('draggable', 'true')
	
		util.addListener(options.node, 'dragstart', function(e) {
		
			var target = e.target || e.srcElement
		
			window.dropZone = options.dropZone
		
			if ( options.data ) e.dataTransfer.setData('Text', options.data)
			else e.dataTransfer.setData('Text', '')
		
			options.start.call(this, target, e)
			
			e.dataTransfer.dropEffect = 'copy'
		})
		
		util.addListener(options.node, 'selectstart', function(e) {
		
			if ( e.preventDefault ) e.preventDefault()
		
			e.srcElement && e.srcElement.dragDrop && e.srcElement.dragDrop()
		
			return false
		})
	}
	
	/**
	 * makes a node a drop zone.
	 * @param node {Element} to be made a drop zone.
	 * @param enter {function} to be called when a draggable item enters the drop zone.
	 * @param leave {function} to be called when a draggable item leaves the drop zone.
	 * @param drop {function} to be called when a draggable item is released whilst inside the drop zone.
	 * @param zoneClass {string} the class that is set when an item is dragged into the zone.
	 */
	DragAndDrop.droppable = function(options) {
	
		var options = options || {}
	
		util.addListener(options.node, 'dragover', function(e) {
		
			var target = e.target || e.srcElement
		
			if ( typeof options.zoneClass == 'string' ) {
			
				var classNode = options.zoneHighlightNode || target
			
				classNode.addClass(options.zoneClass) 
			}
			
			if ( ( options.dropZone && window.dropZone == options.dropZone ) || ! options.dropZone ) {
			
				e.dataTransfer.effectAllowed = 'all'
				
				if (e.preventDefault) e.preventDefault()
			}
			
			else e.dataTransfer.effectAllowed = 'none'
			
			return false
		})
		
		util.addListener(options.node, 'dragenter', function(e) {
		
			var target = e.target || e.srcElement
		
			options.enter && options.enter.call(this, target, e)
		
			return false
		})
		
		util.addListener(options.node, 'dragleave', function(e) {
		
			var target = e.target || e.srcElement
		
			if ( typeof options.zoneClass == 'string' ) {
			
				var classNode = options.zoneHighlightNode || target
			
				classNode.removeClass(options.zoneClass) 
			}
		
			options.leave && options.leave.call(this, target, e)
		
			return false
		})
		
		util.addListener(options.node, 'drop', function(e) {

			var target = e.target || e.srcElement

			if ( typeof options.zoneClass == 'string' ) {
			
				var classNode = options.zoneHighlightNode || target
			
				classNode.removeClass(options.zoneClass) 
			}

			options.drop && options.drop.call(this, target, e)

			if ( options.dropZone ) window.dropZone = undefined

			if ( e.preventDefault ) e.preventDefault()
		})
	}

	return DragAndDrop
})