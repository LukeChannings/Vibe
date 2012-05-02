/**
 * Animator
 * @description module for animating the appearance of elements.
 * @param element - HTML element to animate.
 * @param animation - type of animation to use.
 * @param duration - time the animation takes to complete.
 * @param callback - function to be called when the animation has completed.
 */
define(['util'],function(util) {

	// constructor.
	var UIAnimator = function(element, animation, duration, callback) {
	
		var animation = animation.match(/((slide(out|in))(top|bottom|left|right)|fade(in|out))/i);
	
		this.callback = callback; // make the callback available throughout the object.
	
		if ( animation !== null ) {
		
			var prefix = util.Browser.HasSupport.cssTransitions();
		
			this.directions = {
				'top' : '0px, -1000px',
				'bottom' : '0px, 1000px',
				'left' : '-1000px, 0px',
				'right' : '1000px, 0px'
			}
		
			// handle slideIn animations.
			if ( /slidein/i.test(animation[2]) ) this.slideIn(element, prefix, animation[4], duration);
			
			// handle slideOut animations.
			else if ( /slideout/i.test(animation[2]) ) this.slideOut(element, prefix, animation[4], duration);

			// handle fadeIn animation.
			else if ( /fadein/i.test(animation[0]) ) this.fadeIn(element, prefix, duration);

			// handle fadeOut animation.
			else if ( /fadeout/i.test(animation[0]) ) this.fadeOut(element, prefix, duration);
			
		}
		
		else {
		
			throw util.error("Invalid animation option.","ANIMATE_ERR");
		
			if ( typeof callback == 'function' ) callback();
		
		}
	}
	
	/**
	 * slideIn
	 * @description animation slides in the element from any direction.
	 */
	UIAnimator.prototype.slideIn = function(element, prefix, direction, duration) {
	
		document.body.style.overflow = 'hidden';
	
		var self = this;
	
		// start the element off screen.
		element.style[prefix + 'Transform'] = 'translate(' + this.directions[direction.toLowerCase()] + ')';
		
		// set the transition.
		element.style[prefix + 'Transition'] = '-' + prefix.toLowerCase() + '-transform ' + ( duration || 0.3 )  + 's linear';
	
		setTimeout(function() {
		
			element.style[prefix + 'Transform'] = null;
		
			// cleanup injected attributes.
			setTimeout(function() {
			
				if ( typeof self.callback == 'function' ) self.callback();
			
				element.style[prefix + 'Transition'] = document.body.style.overflow = null;
			
			}, (duration * 1000) || 300 );
		
		}, 100);
	
	}
	
	/**
	 * slideOut
	 * @description animation slides out the element from any direction.
	 */
	UIAnimator.prototype.slideOut = function(element, prefix, direction, duration) {
	
		var self = this;
	
		document.body.style.overflow = 'hidden';
	
		// set the transition.
		element.style[prefix + 'Transition'] = '-' + prefix.toLowerCase() + '-transform ' + ( duration || 0.3 )  + 's linear';
	
		setTimeout(function() {
		
			element.style[prefix + 'Transform'] = 'translate(' + self. directions[direction.toLowerCase()] + ')';
		
			// clean up.
			setTimeout(function() {
			
				if ( typeof self.callback == 'function' ) self.callback();
			
				element.style[prefix + 'Transition'] = element.style[prefix + 'Transform'] = null;
				
			
			}, (duration * 1000) || 300);
		
		}, 100);
	
	}
	
	/**
	 * fadeIn
	 * @description animation fades in an element.
	 */
	UIAnimator.prototype.fadeIn = function(element, prefix, duration) {
	
		var self = this;
	
		element.style.opacity = 0;
	
		element.style[prefix + 'Transition'] = 'opacity ' + (duration || 0.3) + 's linear';
	
		setTimeout(function() {
		
			element.style.opacity = 1;
		
			if ( typeof self.callback == 'function' ) self.callback();
		
		}, 100);
	
	}
	
	/**
	 * fadeOut
	 * @description animation fades out an element.
	 */
	UIAnimator.prototype.fadeOut = function(element, prefix, duration) {

		var self = this;
	
		element.style[prefix + 'Transition'] = 'opacity ' + (duration || 0.3) + 's linear';
		
		setTimeout(function() {
		
			element.style.opacity = 0;
		
			setTimeout(function() {
			
				element.style[prefix + 'Transition'] = null;
				element.style.opacity = null;
			
				if ( typeof self.callback == 'function' ) self.callback();
			
			}, ( duration * 1000 ) || 300 )
			
		}, 100);
	
	}
	
	return UIAnimator;

});