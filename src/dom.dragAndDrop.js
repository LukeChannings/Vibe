define(['util'], function(util) {

	/**
	 * module to abstract binding dropzones and draggable nodes.
	 */
	var DragAndDrop = {}
	
	/**
	 * makes a node draggable
	 * @param options.node {Element} to be made a draggable item.
	 * @param options.start {function} to be called when the element begins to be dragged. Returns the data.
	 */
	DragAndDrop.draggable = function(options) {

		if ( ! util.hasProperties(options, ['start', 'node']) ) {
			throw new Error('Draggable options invalid.')
		}
	
		if ( ! options.disableDraggableAttributes ) {
			
			// set the draggable attribute.
			options.node.setAttribute('draggable', 'true')
		
			util.addListener(options.node, 'dragstart', function(e) {
			
				window.dropZone = options.dropZone
			
				var data = options.start(e.target || e.srcElement, e)
			
				if ( typeof data == 'object' ) {
					data = JSON.stringify(data)
				} else {
					data = data.toString()
				}
			
				e.dataTransfer.setData('Text', data)
			
				e.dataTransfer.dropEffect = 'copy'
			})
		}
		
		util.addListener(options.node, 'selectstart', function(e) {
		
		
			if ( !e.shiftKey && !e.ctrlKey && !e.metaKey ) {
			
				if ( e.preventDefault ) {
					e.preventDefault()
				}
			
				e.srcElement && e.srcElement.dragDrop && e.srcElement.dragDrop()
			}
			
			return false
		})
	}
	
	/**
	 * makes a node a drop zone.
	 * @param node {Element} to be made a drop zone.
	 * @param enter {function} to be called when a draggable item enters the drop zone.
	 * @param whileentered {function} to be called whilst the cursor is in the drop zone.
	 * @param leave {function} to be called when a draggable item leaves the drop zone.
	 * @param drop {function} to be called when a draggable item is released whilst inside the drop zone.
	 * @param zoneClass {string} the class that is set when an item is dragged into the zone.
	 */
	DragAndDrop.droppable = function(options) {
	
		if ( typeof options != 'object' || ( typeof options == 'object' && ( !options.drop || !options.node ) ) ) {
			throw new Error('Droppable options invalid.')
		}
	
		util.addListener(options.node, 'dragover', function(e) {
		
			var target = e.target || e.srcElement
		
			if ( typeof options.zoneClass == 'string' ) {
			
				var classNode = options.zoneHighlightNode || target
			
				util.addClass(classNode, options.zoneClass) 
			}
		
			e.dataTransfer.effectAllowed = 'all'
			
			if ( e.preventDefault ) {
				e.preventDefault()
			}
			
			if ( typeof options.whileentered == 'function' ) {
				options.whileentered(target, e)
			}
			
			return false
		})
		
		util.addListener(options.node, 'dragenter', function(e) {
		
			var target = e.target || e.srcElement
		
			if ( typeof options.enter == 'function' ) {
				options.enter(target, e)
			}
		
			return false
		})
		
		util.addListener(options.node, 'dragleave', function(e) {
		
			var target = e.target || e.srcElement
		
			if ( typeof options.zoneClass == 'string' ) {
				var classNode = options.zoneHighlightNode || target
			
				util.removeClass(classNode, options.zoneClass) 
			}
		
			if ( typeof options.leave == 'function' ) {
				options.leave(target, e)
			}
		
			return false
		})
		
		util.addListener(options.node, 'drop', function(e) {

			var target = e.target || e.srcElement

			if ( typeof options.zoneClass == 'string' ) {
			
				var classNode = options.zoneHighlightNode || target
			
				util.removeClass(classNode, options.zoneClass) 
			}

			var data = e.dataTransfer.getData('Text')

			if ( data ) {
			
				try {
				
					data = JSON.parse(data)
				} catch (ex) {
				
					if ( /^\d+$/.test(data) ) {
						data = parseInt(data, 10)
					} else if ( /^\d+\.\d+$/.test(data) ) {
						data = parseFloat(data)
					}
				}
	
				options.drop(target, e, data)
			}
			
			if ( options.dropZone ) {
				window.dropZone = undefined
			}

			if ( e.preventDefault ) {
				e.preventDefault()
			}
		})
	}

	return DragAndDrop
})