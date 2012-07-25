define(['util', 'lib/DragDealer'], function(util, DragDealer) {

	//
	// Player constructor.
	// @param options
	// @param options.onvolumechange {function} event to be called when the volume slider is moved.
	// @param options.appendTo {Element} dom node to append the volume control to.
	var PlayerVolumeControl = function(options) {
	
		var node = this.node = util.createElement({
			tag : 'div',
			id : 'UIPlayerVolumeControl',
			appendTo : options.appendTo
		})
		
		var container = util.createElement({
			tag : 'ol',
			children : [{
				tag : 'li',
				className : 'mute'
			},{
				tag : 'li',
				className : 'slider'
			},{
				tag : 'li',
				className : 'max'
			}],
			appendTo : node
		})
		
		var slider = this.slider = util.createElement({
			tag : 'div',
			className : 'dragdealer',
			appendTo : container.childNodes[1]
		})
		
		var handle = util.createElement({
			tag : 'div',
			className : 'handle',
			appendTo : slider
		})
		
		var dragdealer = this.dragdealer = new DragDealer(slider, {
			slide : false,
			speed : 100,
			left : 2,
			right : 2,
			// emit the seek event when the slider value changes.
			callback : function(position) {
			
				if ( options.onvolumechange ) {
					options.onvolumechange(Math.round(position * 100))
				}
			}
		})
		
		var mute = util.createElement({
			tag : 'button',
			appendTo : container.childNodes[0]
		})
		
		util.addListener(mute, 'click', function() {
		
			if ( options.onvolumechange ) {
				options.onvolumechange(0)
			}
			
			dragdealer.setValue(0)
		})
		
		var max = util.createElement({
			tag : 'button',
			appendTo : container.childNodes[2]
		})
		
		util.addListener(max, 'click', function() {
		
			if ( options.onvolumechange ) {
				options.onvolumechange(100)
			}
			
			dragdealer.setValue(1)
		})
	}

	return PlayerVolumeControl
})