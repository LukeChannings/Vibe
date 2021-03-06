define(['util'], function(util) {

	/**
	 * construct an info bar.
	 * @param appendTo {object} element to append the info bar element to.
	 */
	var UIPlaylistInfoBar = function(appendTo) {
	
		// create the info bar.
		var node = this.node = util.createElement({
			tag : 'div',
			className : 'infoBar',
			appendTo : appendTo
		})
	}
	
	/**
	 * updates the info bar with new text.
	 * @param info {string} the text to update the info bar with.
	 */
	UIPlaylistInfoBar.prototype.update = function(info) {
	
		// alias the node.
		var node = this.node
	
		// make sure that the info is a string.
		if ( typeof info == 'string' ) {
		
			// remove the previous info.
			util.removeChildren(node)
		
			// create a new info.
			var info = util.createElement({
				tag : 'span',
				inner : info,
				appendTo : node
			})
		
			// disable selection of the text.
			util.disableUserSelect(info)
		}
	}
	
	return UIPlaylistInfoBar
})