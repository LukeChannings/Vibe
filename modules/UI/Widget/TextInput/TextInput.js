/**
 * UIWidgetTextInput
 * @description Creates a text input widget that implements a clear button.
 */
define(['require','util','dependencies/EventEmitter'],function(require,util,EventEmitter){

	util.registerStylesheet(require.toUrl('./TextInput.css'))

	var UIWidgetTextInput = function(options) {
	
		var options = ( options ) ? options : {},
			appendTo = options.appendTo || document.body,
			self = this,
			textInput = this.element = document.createElement('div'),
			input = document.createElement('input')
		
		textInput.setAttributes({'class' : 'TextInputWidget'})
		
		input.setAttributes({'type' : 'text'})
		
		if ( typeof options.customClass == 'string' ) textInput.addClass(options.customClass)
		
		if ( options.placeholder ) {
		
			if ( 'placeholder' in input ) {
				input.setAttribute('placeholder', options.placeholder)
			}
			else {
			
				require(['Model/Placeholder'], function(PlaceholderShim) {
				
					new PlaceholderShim(input, options.placeholder)
				
				})
			}
		}
		
		textInput.appendChild(input)
		
		var clear = document.createElement('button')
		
		util.addListener(input,'keydown',function(e) {
			
			if ( e.keyCode == 13 ) {
			
				var target = e.target || e.srcElement
			
				self.emit('enter', target.value)
				
				if ( e.preventDefault ) e.preventDefault()
				
				else if ( e.stopPropogation ) e.stopPropogation()
				
				else e.returnValue = false
				
				return false
			}
		
		})
		
		util.addListener(input,'keyup',function(e) {

			// don't handle enter or key presses with meta, ctrl, alt or shift.
			if ( e.keyCode.toString().match(/(1(3|7|8)|91)/) || e.metaKey || e.ctrlKey ) return

			var target = e.target || e.srcElement

			if ( target.value.length > 0 ) {
			
				var key = String.fromCharCode(e.keyCode)
				
				if ( ! e.shiftKey ) key = key.toLowerCase()
			
				clear.style.display = 'block'
				
				self.emit('input',target.value,key)
			}
			else {
			
				clear.style.display = 'none'
				self.emit('clear')
			}
		
		})
		
		util.addListener(input,'focus',function() {
			
			textInput.addClass('focus')
			
			self.emit('focus')
		})
		
		util.addListener(input,'blur',function() {
			
			textInput.removeClass('focus')
			
			self.emit('blur')
			
		})
		
		util.addListener(clear,'click',function() {
		
			clear.style.display = 'none'
			
			input.value = ''
		
			input.focus()
		
			self.emit('clear')
		
		})
		
		textInput.appendChild(clear)
		
		appendTo.appendChild(textInput)
		
	}
	
	EventEmitter.augment(UIWidgetTextInput.prototype)
	
	return UIWidgetTextInput

})