define(['util','UI/Widget/ButtonBar'], function(util, UIButtonBarWidget) {

	var UIPlayerControls = function(options) {
	
		var options = typeof options == 'object' ? options : {}
	
		var node = this.node = util.createElement({
			'tag' : 'div',
			'customClass' : 'control',
			'appendTo' : options.appendTo
		})

	}
	
	return UIPlayerControls

})