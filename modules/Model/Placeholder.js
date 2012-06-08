/**
 * Placeholder
 * @description Placeholder shim for non-compliant browsers. (IE.)
 */
define(['util'],function(util){

	var UIPlaceholderWidget = function(node, placeholder) {
	
		if ( node instanceof Element && placeholder ) {
			
			node.value = placeholder
			
			node.addClass('placeholder')
			
			node.setAttribute('placeholder', placeholder)
			
			util.addListener(node,'focus',function(e){
			
				var target = e.target || e.srcElement
				
				if ( target.value == placeholder ) {
				
					target.value = ''
					
					target.removeClass('placeholder')
				}
			
			})
			
			util.addListener(node,'blur',function(e) {
			
				var target = e.target || e.srcElement
			
				if ( target.value == '' ) {
				
					target.value = placeholder
					
					target.addClass('placeholder')
				}
			
			})
			
		}
		
		else throw util.error('Invalid Parameters.')
	}
	
	return UIPlaceholderWidget

})