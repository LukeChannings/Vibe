/*
	<ol id="ContextMenu">
		<li>Item 1</li>
		<li>Item 2</li>
		<li>Item 3</li>
		<hr />
		<li>Other Item 1</li>
		<li>Other Item 2</li>
		<li>Other Item 3</li>
	</ol>
*/
define(['require', 'util/methods'],function(require, util) {

	util.registerStylesheet(require.toUrl('./ContextMenu.css'))

	/**
	 * creates a context menu
	 * @param items {array} list of context menu items.
	 * @param x {number} horizontal coordinate of the menu.
	 * @param y {number} vertical coordinate of the menu.
	 */
	var ContextMenu = function(items, x, y) {
	
		closeContextMenu()
	
		var node = util.createElement({
			tag : 'ol',
			id : 'ContextMenu',
			appendTo : document.body
		})
		
		if ( (x + 170) > window.innerWidth ) x = window.innerWidth - 170
		
		if ( ( y + ( ( items.length * 20 ) + 20 ) ) > window.innerHeight ) y = window.innerHeight - ( ( items.length * 20 ) + 15)
		
		node.style.top = y + 'px'
		node.style.left = x + 'px'
		
		items.forEach(function(item) {
		
			if ( typeof item.callback !== 'function' || typeof item.title !== 'string' ) {
			
				throw new Error("Invalid item.")
				
				return
			}
			
			var itemNode = util.createElement({
				tag : 'li',
				inner : item.title,
				appendTo : node
			})
			
			util.addListener(itemNode, 'click', function(e) {
			
				var closeMenu = item.callback(e)
				
				if ( closeMenu !== false ) closeContextMenu()
			})
		})
		
		util.removeListener(document, 'click', closeContextMenu)
		util.addListener(document, 'click', closeContextMenu)
	}
	
	function closeContextMenu(e) {
		
		var target = ( e && ( e.target || e.srcElement ) ) || null

		if ( !e || target.parentNode.id !== 'ContextMenu' ) {
			
			var contextMenu = document.getElementById('ContextMenu')
			
			if ( contextMenu ) contextMenu.removeNode(true)
		}
	}
	
	return ContextMenu
})