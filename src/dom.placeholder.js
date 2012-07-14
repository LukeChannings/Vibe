/**
 * Placeholder shim for non-compliant browsers. (IE.)
 */
define(['util'], function(util) {

	var Placeholder = function(node, placeholder) {
	
		if ( node instanceof Element && placeholder ) {
			
			node.value = placeholder
			
			util.addClass(node, 'placeholder')
			
			node.setAttribute('placeholder', placeholder)
			
			util.addListener(node,'focus', function(e) {
			
				var target = e.target || e.srcElement
				
				if ( target.value == placeholder ) {
				
					target.value = ''
					
					util.removeClass(target, 'placeholder')
				}
			})
			
			util.addListener(node,'blur', function(e) {
			
				var target = e.target || e.srcElement
			
				if ( target.value == '' ) {
				
					target.value = placeholder
					
					util.addClass(target, 'placeholder')
				}
			})
		} else {
			throw new Error('Invalid Parameters.')
		}
	}
	
	return Placeholder
})