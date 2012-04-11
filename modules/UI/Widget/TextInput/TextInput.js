/**
 * UIWidgetTextInput
 * @description Creates a text input widget that implements a clear button.
 */
define(['require','util','dependencies/EventEmitter'],function(require,util,EventEmitter){

	util.registerStylesheet(require.toUrl('./TextInput.css'));

	function UIWidgetTextInput(options)
	{
	
		var options = ( options ) ? options : {};
		
		var appendTo = options.appendTo || document.body;	
	
		var self = this;
		
		var textInput = this.element = document.createElement('div');
		
		textInput.setAttributes({
			'class' : 'TextInputWidget'
		});
		
		var input = document.createElement('input');
		
		input.setAttributes({
			'type' : 'text'
		});
		
		if ( typeof options.customClass == 'string' ) textInput.addClass(options.customClass);
		
		if ( options.placeholder )
		{
			input.value = options.placeholder;
			input.setAttribute('class','placeholder');
		}
		
		textInput.appendChild(input);
		
		var clear = document.createElement('button');
		
		util.addListener(input,'keyup',function(e){
		
			var target = e.target || e.srcElement;

			if ( target.value.length > 0 )
			{
				var key = String.fromCharCode(e.keyCode);
				
				if ( ! e.shiftKey ) key = key.toLowerCase();
			
				clear.style.display = 'block';
				
				self.emit('input',target.value,key);
			}
			else
			{
				clear.style.display = 'none';
				self.emit('clear');
			}
		
		});
		
		util.addListener(input,'focus',function(){
			
			textInput.addClass('focus');
			
			self.emit('focus');
			
			if ( options.placeholder )
			{
				if ( input.value == options.placeholder )
				{
					input.value = '';
					input.removeAttribute('class');
				}
			}
			
		});
		
		util.addListener(input,'blur',function(){
			
			textInput.removeClass('focus');
			
			self.emit('blur');
			
			if ( options.placeholder )
			{
				if ( input.value == '' )
				{
					input.value = options.placeholder;
					input.addClass('placeholder');
				}
			}
			
		});
		
		util.addListener(clear,'click',function(){
		
			clear.style.display = 'none';
			
			input.value = '';
		
			input.focus();
		
			self.emit('clear');
		
		});
		
		textInput.appendChild(clear);
		
		appendTo.appendChild(textInput);
		
	}
	
	EventEmitter.augment(UIWidgetTextInput.prototype);
	
	return UIWidgetTextInput;

});