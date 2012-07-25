define(['util'], function(util) {

	util.registerStylesheet("stylesheets/ui.widget.contextMenu.css")

	// contains any displayed context menu.
	var node

	// closes any context menu that is presently displayed.
	function close() {
	
		if ( node ) {
			util.removeNode(node)
			node = undefined
		}
	}

	// creates a context menu
	// @param e {Event} the contextmenu event that triggered ContextMenu.
	// @param items {Array} a list of context menu items compliant with the ContextMenuItem template.
	var ContextMenu = function(e, items) {
	
		// close any existing context menus.
		close()
	
		// create a context menu.
		node = util.createElement({
			tag : 'ol',
			id : "ContextMenu"
		})
		
		// set the context menu position to be the coordinates of the cursor.
		node.setAttribute(
			'style',
			"left: " + e.clientX + "px; top: " + e.clientY + "px"
		)
		
		// add the items and bind the handlers.
		util.forEach(items, function(item) {
		
			if ( item.optional && ! item.optional() ) {
				return
			}
		
			if ( typeof item.title == 'function' ) {
				item.title = item.title()
			}
		
			var li = util.createElement({
				tag : 'li',
				inner : item.title,
				appendTo : node
			})
			
			util.addListener(li, 'click', function(event) {
			
				var target = e.target || e.srcElement,
					contextTarget = event.target || event.srcElement
			
				item.callback(target, contextTarget, e, event)
				
				close()
			})
		})
		
		// add the context menu to the DOM tree.
		document.body.appendChild(node)
		
		// closes the context menu when an area outside of the menu is clicked.
		util.addListener(window, 'click', function (e) {
		
			var target = e.target || e.srcElement
			
			if ( node && target.parentNode !== node ) {
				close()
			}
		})
		
		// make the close method available.
		this.close = close
		
		// prevent the contextmenu event from bubbling
		// and drop the default browser action.
		e.preventDefault && e.preventDefault()
		e.stopPropagation && e.stopPropagation()
		e.returnValue = false
	}
	
	return ContextMenu
})