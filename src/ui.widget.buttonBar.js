define(['util'], function(util) {

	util.registerStylesheet('./stylesheets/ui.widget.buttonBar.css')

	var UIButtonBarWidget = function(options) {
	
		if ( typeof options == 'object' ) {
			
			var node = this.node = util.createElement({
				tag : 'ol',
				appendTo : options.appendTo || document.body,
				customClass : ( ! options.noClass ) ? undefined : 'UIButtonBarWidget'
			})
			
			var buttons = this.buttons = {}
			
			if ( options.buttons instanceof Array ) {
			
				util.forEach(options.buttons, function(button) {
				
					var li = util.createElement({
						tag : 'li',
						appendTo : node
					})
				
					var item = util.createElement({
						tag : 'button',
						appendTo : li
					})
				
					if ( options.noClass ) {
						util.addClass(item, 'UIButtonWidget')
					}
				
					if ( ! button.iconButton ) {
						item.innerHTML = button.text || button.title || ''
					}
				
					if ( button.customClass ) {
						util.addClass(item, button.customClass)
						util.addClass(li, button.customClass)
					}
				
					if ( typeof button.titleText == 'string' ) {
						item.setAttribute('title', button.titleText)
					}
				
					if ( typeof button.callback == 'function' ) {
					
						util.addListener(item, 'click', (function(node) {
					
							return function() {
							
								button.callback(node)
							
							}
						
						})(item))
					}
				
					if ( button.floatRight ) {
						util.addClass(li, 'right')
					}
					
					if ( button.isIcon ) {
						util.addClass(item, 'icon')
					}
				
					buttons[button.title || button.customClass] = {
						'node' : item,
						'item' : li
					}
				
				})
			} else {
				throw new Error("UIButtonBarWidget requires an array of button objects.")
			}
			
		} else {
			return false
		}
	}

	return UIButtonBarWidget
})