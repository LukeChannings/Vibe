define(['require','util'],function(require, util){

	util.registerStylesheet(require.toUrl('./ButtonBar.css'))

	var UIButtonBarWidget = function(options) {
	
		if ( typeof options == 'object' ) 
		{
			
			var node = this.node = util.createElement({
				'tag' : 'ol',
				'appendTo' : options.appendTo || document.body,
				'customClass' : 'UIButtonBarWidget'
			})
			
			var buttons = this.buttons = {}
			
			if ( options.buttons instanceof Array )
			{
				options.buttons.forEach(function(button) {
				
					var li = util.createElement({'tag' : 'li', appendTo : node})
				
					var item = util.createElement({'tag' : 'button', appendTo : li})
				
					item.addClass('UIButtonWidget')
				
					if ( ! button.iconButton ) item.innerHTML = button.text || button.title || ''
				
					if ( button.customClass ) item.addClass(button.customClass)
				
					if ( typeof button.titleText == 'string' ) item.setAttribute('title', button.titleText)
				
					if ( typeof button.callback == 'function' )  util.addListener(item, 'click', (function(node) {
					
						return function() {
						
							button.callback(node)
						
						}
					
					})(item))
				
					if ( button.floatRight ) li.addClass('right')
				
					if ( button.isIcon ) item.addClass('icon')
				
					buttons[button.text || button.title] = {
						'node' : item,
						'item' : li
					}
				
				})
			}
			else {
				
				throw util.error("UIButtonBarWidget requires an array of button objects.")
				
			}
			
		}
		
		else return false
		
	}

	return UIButtonBarWidget

})