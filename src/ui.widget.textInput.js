/**
 * Creates a text input widget that implements a clear button.
 */
define(['util'], function(util) {

	util.registerStylesheet('stylesheets/ui.widget.textInput.css')

	var UIWidgetTextInput = function(options) {

		var options = ( options ) ? options : {},
		
		textInput = this.element = util.createElement({
			tag : 'div',
			customClass : 'TextInputWidget',
			appendTo : options.appendTo || document.body
		}),
		
		input = util.createElement({
			tag : 'input',
			appendTo : textInput,
			setAttributes : {
				'type' : 'text'
			}
		}),
		
		clear = util.createElement({
			tag : 'button',
			appendTo : textInput
		}),
		
		self = this

		if ( typeof options.customClass == 'string' ) {
			util.addClass(textInput, options.customClass)
		}
		
		if ( options.placeholder ) {
		
			if ( 'placeholder' in input ) {
				input.setAttribute('placeholder', options.placeholder)
			} else {
			
				require(['model.placeholder'], function(Placeholder) {
				
					new Placeholder(input, options.placeholder)
				})
			}
		}

		util.addListener(input, 'keydown', function(e) {
			
			if ( e.keyCode == 13 ) {
			
				var target = e.target || e.srcElement
			
				self.onenter(target.value)
				
				if ( e.preventDefault ) e.preventDefault()
				
				else if ( e.stopPropogation ) e.stopPropogation()
				
				else e.returnValue = false
				
				return false
			}
		
		})
		
		util.addListener(input, 'keyup', function(e) {

			// don't handle enter or key presses with meta, ctrl, alt or shift.
			if ( e.keyCode.toString().match(/(1(3|7|8)|91)/) || e.metaKey || e.ctrlKey ) return

			var target = e.target || e.srcElement

			if ( target.value.length > 0 ) {
			
				var key = String.fromCharCode(e.keyCode)
				
				if ( ! e.shiftKey ) key = key.toLowerCase()
			
				clear.style.display = 'block'
				
				if ( options.oninput ) {
					options.oninput(target.value, key)
				}
			}
			else {
			
				clear.style.display = 'none'
				if ( self.onclear ) {
					self.onclear(target.value)
				}
			}
		
		})
		
		util.addListener(input, 'focus', function() {
			
			util.addClass(textInput, 'focus')
			
			if ( self.onfocus ) {
				self.onfocus(target.value)
			}
		})
		
		util.addListener(input, 'blur', function() {
			
			util.removeClass(textInput, 'focus')
			
			if ( self.onblur ) {
				self.onblur(target.value)
			}
		})
		
		util.addListener(clear, 'click', function() {
		
			clear.style.display = 'none'
			
			input.value = ''
		
			input.focus()
		
			if ( self.onclear ) {
				self.onclear(target.value)
			}
		})
	}
	
	return UIWidgetTextInput
})