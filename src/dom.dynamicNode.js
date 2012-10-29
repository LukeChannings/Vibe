define(['util'], function(util) {

	//
	// dynamically scales a node based on a function.
	// @param node {Element} the DOM node to be scaled.
	// @parm dimensions {function} the function that returns a height and width to scale to.
	var DynamicNode = function(node, dimensions) {
	
		function resize() {

			var a = dimensions()
			
			if ( a.height ) {
			
				node.style.height = a.height + "px"
			}
			
			if ( a.width ) {
			
				node.style.width = a.width + "px"
			}
		}
	
		util.addListener(window, 'resize', resize)
		util.addListener(document, 'resize', resize)
		
		resize()
	}
	
	return DynamicNode
})