//
// Animator
// animates an element on or off the screen.
define(['util'], function(util) {

	/**
	 * constructs an Animator instance.
	 * @param element - HTML element to animate.
	 * @param animation - type of animation to use.
	 * @param duration - time the animation takes to complete.
	 * @param callback - function to be called when the animation has completed.
	 */
	var Animator = function(element, animation, duration, callback) {
	
		var animation = animation.match(/((slide(out|in))(top|bottom|left|right)|fade(in|out))/i)
	
		this.callback = callback // make the callback available throughout the object.
	
		if ( animation !== null ) {
		
			var prefix = util.browser.hasSupport.cssTransitions
		
			this.directions = {
				'top' : '0px, -1000px',
				'bottom' : '0px, 1000px',
				'left' : '-1000px, 0px',
				'right' : '1000px, 0px'
			}
		
			// handle slideIn animations.
			if ( /slidein/i.test(animation[2]) ) {
				this.slideIn(element, prefix, animation[4], duration)
			} else if ( /slideout/i.test(animation[2]) ) {
			
				// handle slideOut animations.
				this.slideOut(element, prefix, animation[4], duration)
			} else if ( /fadein/i.test(animation[0]) ) {
			
				// handle fadeIn animation.
				this.fadeIn(element, prefix, duration)
			} else if ( /fadeout/i.test(animation[0]) ) {
			
				// handle fadeOut animation.
				this.fadeOut(element, prefix, duration)
			}
		} else {
		
			throw new Error("Invalid animation option.")
		
			if ( typeof callback == 'function' ) {
				callback()
			}
		}
	}
	
	/**
	 * animation to slide in the element from any direction.
	 * @param node {Element} the element to slide in.
	 * @param prefix {string} the vendor prefix for CSS3 animations.
	 * @param direction {string} the direction from which the node will slide. Options are: top, bottom, left and right.
	 * @param duration {number} the duration of the animation in seconds.
	 */
	Animator.prototype.slideIn = function(node, prefix, direction, duration) {
	
		var self = this
	
		document.body.style.overflow = 'hidden'
	
		// start the element off screen.
		node.style[prefix + 'Transform'] = 'translate(' + this.directions[direction.toLowerCase()] + ')'
		
		// set the transition.
		node.style[prefix + 'Transition'] = '-' + prefix.toLowerCase() + '-transform ' + ( duration || 0.3 )  + 's linear'
	
		setTimeout(function() {
		
			node.style[prefix + 'Transform'] = null
		
			// cleanup injected attributes.
			setTimeout(function() {
			
				if ( typeof self.callback == 'function' ) {
					self.callback()
				}
				
				node.style[prefix + 'Transition'] = document.body.style.overflow = null
			
			}, (duration * 1000) || 300 )
		
		}, 100)
	}
	
	/**
	 * animation to slide out the element from any direction.
	 * @param node {Element} the element to slide out.
	 * @param prefix {string} the vendor prefix for CSS3 animations.
	 * @param direction {string} the direction from which the node will slide. Options are: top, bottom, left and right.
	 * @param duration {number} the duration of the animation in seconds.
	 */
	Animator.prototype.slideOut = function(node, prefix, direction, duration) {
	
		var self = this
	
		document.body.style.overflow = 'hidden'
	
		// set the transition.
		node.style[prefix + 'Transition'] = '-' + prefix.toLowerCase() + '-transform ' + ( duration || 0.3 )  + 's linear'
	
		setTimeout(function() {
		
			node.style[prefix + 'Transform'] = 'translate(' + self.directions[direction.toLowerCase()] + ')'
		
			// clean up.
			setTimeout(function() {
			
				if ( typeof self.callback == 'function' ) {
					self.callback()
				}
				
				node.style[prefix + 'Transition'] = node.style[prefix + 'Transform'] = null
				
			
			}, (duration * 1000) || 300)
		
		}, 100)
	}
	
	/**
	 * animation to fade in an element.
	 * @param node {Element} the element to fade in.
	 * @param prefix {string} the vendor prefix for CSS3 animations.
	 * @param duration {number} the duration of the animation in seconds.
	 */
	Animator.prototype.fadeIn = function(element, prefix, duration) {
	
		var self = this
	
		element.style.opacity = 0
	
		element.style[prefix + 'Transition'] = 'opacity ' + (duration || 0.3) + 's linear'
	
		// clean up.
		setTimeout(function() {
		
			element.style.opacity = 1
		
			setTimeout(function() {
			
				element.style[prefix + 'Transition'] = null
				element.style.opacity = null
			
				if ( typeof self.callback == 'function' ) {
					self.callback()
				}
			
			}, ( duration * 1000 ) || 300 )
			
		}, 100)
	}
	
	/**
	 * animation to fade in an element.
	 * @param node {Element} the element to fade in.
	 * @param prefix {string} the vendor prefix for CSS3 animations.
	 * @param duration {number} the duration of the animation in seconds.
	 */
	Animator.prototype.fadeOut = function(node, prefix, duration) {

		var self = this
	
		node.style[prefix + 'Transition'] = 'opacity ' + (duration || 0.3) + 's linear'
		
		setTimeout(function() {
		
			node.style.opacity = 0
		
			setTimeout(function() {
			
				node.style[prefix + 'Transition'] = null
				node.style.opacity = null
			
				if ( typeof self.callback == 'function' ) {
					self.callback()
				}
			
			}, ( duration * 1000 ) || 300 )
			
		}, 100)
	}
	
	return Animator
})