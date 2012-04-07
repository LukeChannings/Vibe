/**
 * UIWidgetTextInput
 * @description Creates a text input widget that implements a clear button.
 */
define(['require','util','dependencies/EventEmitter'],function(require,util,EventEmitter){

	util.registerStylesheet(require.toUrl('UI/Widget/TextInput.css'));

	function UIWidgetTextInput(config)
	{
	
		var config = ( config ) ? config : {};
		
		var appendNode = config.appendNode || document.body;	
	
		var self = this;
		
		var textInput = document.createElement('div');
		
		textInput.setAttributes({
			'class' : 'UIWidgetSearchInput'
		});
		
		var input = document.createElement('input');
		
		input.setAttributes({
			'type' : 'text'
		});
		
		if ( config.placeholder )
		{
			input.value = config.placeholder;
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
			
				console.log(key);
			
				clear.style.opacity = 1;
				self.emit('input',target.value,key);
			}
			else
			{
				clear.style.opacity = 0;
				self.emit('clear');
			}
		
		});
		
		util.addListener(input,'focus',function(){
			
			textInput.setAttribute('class','UIWidgetSearchInput focus');
			
			self.emit('focus');
			
			if ( config.placeholder )
			{
				if ( input.value == config.placeholder )
				{
					input.value = '';
					input.removeAttribute('class');
				}
			}
			
		});
		
		util.addListener(input,'blur',function(){
			
			textInput.setAttribute('class','UIWidgetSearchInput');
			
			self.emit('blur');
			
			if ( config.placeholder )
			{
				if ( input.value == '' )
				{
					input.value = config.placeholder;
					input.setAttribute('class','placeholder');
				}
			}
			
		});
		
		util.addListener(clear,'click',function(){
		
			clear.style.opacity = 0;
			
			input.value = '';
		
			input.focus();
		
			self.emit('clear');
		
		});
		
		textInput.appendChild(clear);
		
		appendNode.appendChild(textInput);
		
	}
	
	EventEmitter.augment(UIWidgetTextInput.prototype);
	
	return UIWidgetTextInput;

});