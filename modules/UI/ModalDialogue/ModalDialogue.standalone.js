(function() {

// forEach.
	if ( typeof Array.prototype.forEach == "undefined" )
	{
		Array.prototype.forEach = function(callback){
		
			if ( typeof callback == "function" )
			{
				for ( var i = 0; i < this.length; i++ )
				{
					callback(this[i],i,this);
				}
			}
		}
	}
	
	// setAttributes.
	if ( typeof Element.prototype.setAttributes == "undefined" )
	{
		Element.prototype.setAttributes = function(attributes){
			
			var self = this;
				
			if ( attributes instanceof Array )
			{
				attributes.forEach(function(attribute){
					
					self.setAttribute(attribute[0],attribute[1]);
					
				});
			}
			else if ( typeof attributes == "object" )
			{
				for ( var i in attributes )
				{
					self.setAttribute(i,attributes[i]);
				}
			}
		}
	}
	
	// removeNode. (Overwrite existing prototypes. IE8 is gay.)
	if ( typeof  Element.prototype.removeNode == 'undefined')
	{
		Element.prototype.removeNode = function()
		{
			this.parentNode.removeChild(this);
		}
	}
	
	// removeChildren.
	if ( typeof Element.prototype.removeChildren == "undefined" )
	{
		Element.prototype.removeChildren = function()
		{
			while ( this.firstChild )
			{
				this.removeChild(this.firstChild);
			}
		}
	}
	
	// toggleClass.
	if ( typeof Element.prototype.toggleClass == "undefined" )
	{
		Element.prototype.toggleClass = function(name)
		{
			var regex = new RegExp(name);
		
			if ( regex.test(this.className) )
			{
				this.className = this.className.replace(name,'');
			}
			else
			{
				if ( this.className.length == 0 ) this.className = name;
				else this.className += ' ' + name;
			}
		}
	}
	
	// appendChildren
	if ( typeof Element.prototype.appendChildren == 'undefined' )
	{
		Element.prototype.appendChildren = function(children)
		{
			
			var self = this;
			
			children.forEach(function(child){
			
				if ( child instanceof Element )
				{
					self.appendChild(child);
				}
			})
			
		}
	}
	
	// Array indexOf. (for IE <= 8)
	// From MDC - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
	if (! Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;
	
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;
	
	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}
	
	// addClass
	if ( ! Element.prototype.addClass )
	{
		Element.prototype.addClass = function(className){
		
			if ( this.className.length == 0 )
			{
				this.className = className;
			}
			else if ( ! new RegExp('(^| )' + className + '( |$)').test(this.className) )
			{
				this.className += ' ' + className;
			}
		
		}
	}

	// removeClass
	if ( ! Element.prototype.removeClass )
	{
		Element.prototype.removeClass = function(className){
		
			this.className = this.className.replace(new RegExp(' ?' + className + ' ?'),'');
		
			if ( this.className.length == 0 )
			{
				this.removeAttribute('class');
			}
		
		}
	}
	
	// hasClass
	if ( ! Element.prototype.hasClass )
	{
		Element.prototype.hasClass = function(className){
		
			return new RegExp("(^| )" + className + "($| )").test(this.className);
			
		}
	}
	
	// console exception prevention.
	if ( ! window.console || ! window.console.log || ! window.console.warn || ! window.console.error )
	{
		if ( ! window.console ) window.console = {};
		
		if ( ! console.log ) window.console.log = function(){}
		
		if ( ! console.warn ) window.console.warn = function(){}
		
		if ( ! console.error ) window.console.error = function(){} 
	}

	/**
	 * Util Object.
	 */
	var util = {
		addListener : (function(){
		
			if ( document.addEventListener )
			{
				return function(element,listenFor,callback)
				{
					element.addEventListener(listenFor,callback,false);
				}
			}
			else
			{
				return function(element,listenFor,callback)
				{
					element.attachEvent('on' + listenFor, callback);
				}
			}
		
		})(),
		removeListener : (function(){
		
			if ( document.removeEventListener )
			{
				return function(element,listenFor,dispatch)
				{
					element.removeEventListener(listenFor,dispatch,false);
				}
			}
			else
			{
				return function(element,listenFor,dispatch)
				{
					element.detachEvent(listenFor,dispatch);
				}
			}
		
		})(),
		registerStylesheet : function(url){
		
			if ( ! window.registeredStylesheets ) window.registeredStylesheets = [];
		
			if ( window.registeredStylesheets.indexOf(url) == -1)
			{
				(document.head || document.getElementsByTagName("head")[0]).appendChild(function(){
				
					var link = document.createElement('link');
				
					link.setAttributes({
						'rel' : 'stylesheet',
						'type' : 'text/css',
						'href' : url
					});
				
					return link;
				
				}());
				
				window.registeredStylesheets.push(url);
			}
		},
		Browser : {
			isMobile : function(){
			
				// simple test to check if the browser identifies itself as mobile. 
				// (It's browser detection, but the only option sadly.)
				return /(iPhone|Android|Mobile)/i.test(navigator.userAgent);
			
			},
			isIE : function() {
			
				return /MSIE/i.test(navigator.userAgent);
			
			},
			HasSupport : {
				dragAndDrop : function() {
				
					// check for draggable attribute in a <div>.
					return ( 'draggable' in document.createElement('div') );
				},
				svg : function() {
				
					// check hasFeature for basic SVG support.
					return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
				},
				cssTransitions : function() {
			
					// possible prefixes.
					var prefix = ["transition", "WebkitTransition", "MozTransition", "OTransition", "msTransition"];
					
					// loop through possibilities.
					for ( var i = 0; i < prefix.length; i++ )
					{
						// check if the possibility is present, if so, return the property that was found.
						if ( prefix[i] in document.createElement('div').style ) return prefix[i].replace('Transition','');
					
					}
					
					// if no possibilities match then transitions are unsupported, return false.
					return false;
				},
				localStorage : function() {
				
					try {
					
						if ( window.localStorage )
						{
							return true;
						}
						else {
							return false;
						}
						
					}
					catch (ex) {
						
						return ex;
						
					}
				
				}
			}
		},
		htmlEntities : function(string){

			return string.replace(/&/g,'&#38;').replace(/</g,'&#60;').replace(/>/g,'&#62;').replace(/£/g,'&#163;');
			
		},
		// doubleClick
		// handles simultaneous click events allowing for separate functions
		// to be used for a single click and a double click. Standard timeout 
		// is 170ms, otherwise the timeout can be set in settings using the 
		// 'clickTimeout' key.
		doubleClick : function(element,click,doubleClick, clickTimeoutDuration){
		
			this.addListener(element,'click',function(e){
			
				var target = e.target || e.srcElement;
			
				if ( typeof clickTimeout == 'undefined' )
				{
					clickTimeout = setTimeout(function(){
					
						clickTimeout = undefined;
						
						if ( typeof click == 'function' ) click(target);
					
					}, clickTimeoutDuration || 170);
				}
				else
				{
					clearTimeout(clickTimeout);
					clickTimeout = undefined;
					doubleClick(target);
				}
			
			});
		
		},
		cacheImage : function(url){
		
			var image = new Image();
			
			image.src = url;
		
		},
		formatTime : function(seconds){
		
			// round.
			seconds = Math.ceil(seconds);
		
			// minutes.
			var minutes = Math.ceil(seconds / 60);
			
			var seconds = seconds % 60;
			
			if ( String(minutes).length == 1 ) minutes = '0' + String(minutes);
			
			if ( String(seconds).length == 1 ) seconds = '0' + String(seconds);
			
			return minutes + ':' + seconds;
		
		},
		createElement : function(def){
		
			var self = this;
		
			// check that the definition is an object and contains a tag property.
			if ( typeof def == 'object' && def.hasOwnProperty('tag') )
			{
				// create an element.
				var element = document.createElement(def.tag);
				
				// set inner.
				if ( typeof def.inner == 'string' ) element.innerHTML = def.inner;
				
				// set an Id.
				if ( def.id ) element.setAttribute('id',def.id);
				
				// set a class.
				if ( def.customClass ) element.setAttribute('class',def.customClass);
				
				// check for custom attributes.
				if ( def.setAttributes ) element.setAttributes(def.setAttributes);
				
				// check for children.
				if ( def.children && def.children instanceof Array )
				{
					def.children.forEach(function(child){
					
						child.appendTo = element;
					
						self.createElement(child);
					
					});
				}
				
				// check if we're appending the element.
				if ( def.appendTo && def.appendTo instanceof Element )
				{
					def.appendTo.appendChild(element);
				}
				
				return element;
				
			}
			
			// return false if there is no definition.
			else return false;
		
		},
		error : function(message, type){
		
			var error = new Error();
		
			error.message = message || 'Unknown error.'
		
			error.type = type;
		
			return error;
		
		},
		getMetaContent : function(name) {
		
			var metaTags = document.getElementsByTagName('meta');
		
			for ( var i = 0; i < metaTags.length; i++ )
			{
				if ( metaTags[i].getAttribute('name') == name ) return metaTags[i].getAttribute('content');
			}
			
			return false;
		
		}
	}

	// constructor.
	var Animator = function(element, animation, duration, callback) {
	
		var animation = animation.match(/((slide(out|in))(top|bottom|left|right)|fade(in|out))/i)
	
		this.callback = callback // make the callback available throughout the object.
	
		if ( animation !== null ) {
		
			var prefix = util.Browser.HasSupport.cssTransitions()
		
			this.directions = {
				'top' : '0px, -1000px',
				'bottom' : '0px, 1000px',
				'left' : '-1000px, 0px',
				'right' : '1000px, 0px'
			}
		
			// handle slideIn animations.
			if ( /slidein/i.test(animation[2]) ) this.slideIn(element, prefix, animation[4], duration)
			
			// handle slideOut animations.
			else if ( /slideout/i.test(animation[2]) ) this.slideOut(element, prefix, animation[4], duration)

			// handle fadeIn animation.
			else if ( /fadein/i.test(animation[0]) ) this.fadeIn(element, prefix, duration)

			// handle fadeOut animation.
			else if ( /fadeout/i.test(animation[0]) ) this.fadeOut(element, prefix, duration)
			
		}
		
		else {
		
			throw util.error("Invalid animation option.","ANIMATE_ERR")
		
			if ( typeof callback == 'function' ) callback()
		
		}
	}
	
	/**
	 * slideIn
	 * @description animation slides in the element from any direction.
	 */
	Animator.prototype.slideIn = function(element, prefix, direction, duration) {
	
		document.body.style.overflow = 'hidden'
	
		var self = this
	
		// start the element off screen.
		element.style[prefix + 'Transform'] = 'translate(' + this.directions[direction.toLowerCase()] + ')'
		
		// set the transition.
		element.style[prefix + 'Transition'] = '-' + prefix.toLowerCase() + '-transform ' + ( duration || 0.3 )  + 's linear'
	
		setTimeout(function() {
		
			element.style[prefix + 'Transform'] = null
		
			// cleanup injected attributes.
			setTimeout(function() {
			
				if ( typeof self.callback == 'function' ) self.callback()
			
				element.style[prefix + 'Transition'] = document.body.style.overflow = null
			
			}, (duration * 1000) || 300 )
		
		}, 100)
	
	}
	
	/**
	 * slideOut
	 * @description animation slides out the element from any direction.
	 */
	Animator.prototype.slideOut = function(element, prefix, direction, duration) {
	
		var self = this
	
		document.body.style.overflow = 'hidden'
	
		// set the transition.
		element.style[prefix + 'Transition'] = '-' + prefix.toLowerCase() + '-transform ' + ( duration || 0.3 )  + 's linear'
	
		setTimeout(function() {
		
			element.style[prefix + 'Transform'] = 'translate(' + self. directions[direction.toLowerCase()] + ')'
		
			// clean up.
			setTimeout(function() {
			
				if ( typeof self.callback == 'function' ) self.callback()
			
				element.style[prefix + 'Transition'] = element.style[prefix + 'Transform'] = null
				
			
			}, (duration * 1000) || 300)
		
		}, 100)
	
	}
	
	/**
	 * fadeIn
	 * @description animation fades in an element.
	 */
	Animator.prototype.fadeIn = function(element, prefix, duration) {
	
		var self = this
	
		element.style.opacity = 0
	
		element.style[prefix + 'Transition'] = 'opacity ' + (duration || 0.3) + 's linear'
	
		// clean up.
		setTimeout(function() {
		
			element.style.opacity = 1
		
			element.style[prefix + 'Transition'] = element.style.opacity = null
			
			if ( typeof self.callback == 'function' ) self.callback()
		
		}, 100)
	
	}
	
	/**
	 * fadeOut
	 * @description animation fades out an element.
	 */
	Animator.prototype.fadeOut = function(element, prefix, duration) {

		var self = this
	
		element.style[prefix + 'Transition'] = 'opacity ' + (duration || 0.3) + 's linear'
		
		setTimeout(function() {
		
			element.style.opacity = 0
		
			setTimeout(function() {
			
				element.style[prefix + 'Transition'] = null
				element.style.opacity = null
			
				if ( typeof self.callback == 'function' ) self.callback()
			
			}, ( duration * 1000 ) || 300 )
			
		}, 100)
	
	}

	var Placeholder = function(node, placeholder) {
	
		if ( node instanceof Element && placeholder )
		{
			
			node.value = placeholder
			
			node.addClass('placeholder')
			
			node.setAttribute('placeholder', placeholder)
			
			util.addListener(node,'focus',function(e){
			
				var target = e.target || e.srcElement
				
				if ( target.value == placeholder )
				{
					target.value = ''
					
					target.removeClass('placeholder')
				}
			
			})
			
			util.addListener(node,'blur',function(e){
			
				var target = e.target || e.srcElement
			
				if ( target.value == '' )
				{
					target.value = placeholder
					
					target.addClass('placeholder')
				}
			
			})
			
		}
		else {
			throw util.error('Invalid Parameters.')
		}
	}

	util.addListener(window, 'load', function() {

	// the overlay upon which the dialogue is appended.
	var overlay = ( document.getElementById('ModalDialogueOverlay') ) ?  document.getElementById('ModalDialogueOverlay') : util.createElement({'tag' : 'div', 'id' : 'ModalDialogueOverlay', appendTo : document.body}),
		currentDialogue = null, // the current visible dialogue.
		AnimationPrefix = util.Browser.HasSupport.cssTransitions(), // browser-specific prefix for animation directives.
		animateIn, // animation with which to open the dialogue.
		animateOut // animation with which to close the dialogue.
	
	/**
	 * isValidMDD
	 * @description Check that the Modal Dialogue Definition is valid.
	 * @param MDD (object) - Modal Dialogue Definition.
	 */
	function isValidMDD(MDD) {
		// make sure the MDD is actually an object.
		if ( typeof MDD == 'object' && !( MDD instanceof Array) )
		{
			// check for a title and body.
			if ( ! MDD.title || ! MDD.body ) return false
			
			// check if the MDD is part of a wizard.
			if ( MDD.isWizardDialogue )
			{
				// check for buttons.
				if ( ! MDD.buttons ) return false
				else
				{
					// if there is no previous button, next button or close button then the user cannot escape.
					if ( ! MDD.buttons.next && ! MDD.buttons.prev && ! MDD.buttons.close ) return false
					
				}
			}
			
			if ( MDD.form )
			{
				if ( ! MDD.form.name || ! MDD.form.inputs ) return false
			}
			
			return true
		}
	}

	/**
	 * dialogueFromMDD
	 * @description Creates a fully populated dialogue element from an MDD.
	 * @param MDD (object) - Modal Dialogue Definition.
	 */
	var dialogueFromMDD = function(MDD) {
	
		// alias this.
		var self = this
		this.MDD = MDD
		
		// check that the MDD is valid.
		if ( isValidMDD(MDD) )
		{
			// create the dialogue element.
			var dialogue = this.dialogue = util.createElement({'tag' : 'div', 'id' : MDD.customId || 'ModalDialogue', 'customClass' : 'visible'})
			
			// check if this is an error dialogue
			if ( MDD.errorDialogue == true ) dialogue.addClass('error')
		
			// check for custom alignment specification.
			if ( MDD.alignment && /^(center|right|justify)$/.test(MDD.alignment) ) dialogue.addClass(MDD.alignment)
			
			// create the title.
			var title = util.createElement({'tag' : 'h1', 'inner' : MDD.title, 'appendTo' : dialogue})
			
			// create the body.
			this.createBody(MDD.body)
			
			// create a form in the dialogue if there is one specified.
			if ( MDD.form ) this.createForm(MDD.form)
			
			// create buttons if there are any specified.
			if ( MDD.buttons ) this.createButtons(MDD.buttons, MDD)
			
			// append any custom classes.
			if ( MDD.customClass ) dialogue.addClass(MDD.customClass)
			
			// return the constructed element.
			return dialogue
			
		}
		
		// handle invalid MDD.
		else throw util.error('Invalid Modal Dialogue Definiion.','MDD_ERR')
	
	}
	
	/**
	 * createBody
	 * @description constructs the body for the modal dialogue.
	 * @param body (object) - object to define a form.
	 */
	dialogueFromMDD.prototype.createBody = function( body ) {
	
		var self = this
	
		// if the parameter is not an array then convert it.
		if ( !( body instanceof Array ) ) body = [body]
		
		// iterate the body.
		body.forEach(function(bodyPart){
		
			// check if the item is an HTMLElement.
			if ( typeof bodyPart == 'object' && bodyPart instanceof Element )
			{
				// if it is, append the element to the dialogue.
				self.dialogue.appendChild(item)
			}
				
			// otherwise check if the element is a string.
			else if ( typeof bodyPart == 'string' )
			{
				// if the text does not have tags then wrap it in a <p>.
				if ( !( /\<.+\>.*\<.+\>/.test(bodyPart) ) ) bodyPart = '<p>' + bodyPart + '</p>'
			
				// if the element is a string then add it directly.
				self.dialogue.innerHTML += bodyPart
			}
		
		})
	
	}

	/**
	 * createForm
	 * @description constructs the form for the modal dialogue.
	 * @param form (object) - definition object for a form.
	 */
	dialogueFromMDD.prototype.createForm = function( form ) {
	
		// construct the form.
		var formElement = util.createElement({
			'tag' : 'form',
			'appendTo' : this.dialogue,
			'setAttributes' : {
				'name' : form.name,
				'method' : 'post'
			}
		})
	
		// array to contain the inputs.
		var inputs = []
	
		// iterate the inputs.
		form.inputs.forEach(function(input, index) {
		
			// check if the input has a title.
			if ( input.title ) var label = util.createElement({'tag' : 'label', 'inner' : input.title})
		
			// check if the input is <select>
			if ( input.type && input.type == 'select' ) {
			
				// create a select input.
				var element = document.createElement('select')
				
				// iterate the options.
				input.options.forEach(function(option) {
					
					// create an option element.
					var input = util.createElement({
						'tag' : 'option',
						'inner' : option,
						'appendTo' : element,
						'setAttributes' : {
							'value' : option
						}
					})
					
				})
				
			}
			
			// if it's not a select element it's an input.
			else {
				
				var element = util.createElement({
					'tag' : 'input',
					'setAttributes' : {
						'name' : input.name || form.name + '-' + index,
						'type' : input.type || 'text'
					}
				})
				
			}
			
			// check for a placeholder.
			if ( input.placeholder )
			{
			
				// check for native placeholder support.
				if ( 'placeholder' in element ) {
					element.setAttribute('placeholder', input.placeholder)
				}
				
				// if there is no native support then shim it.
				else new Placeholder(element, input.placeholder)
			}
			
			// if the MDD specified an input title..
			if ( label )
			{
				// append the input to the label
				label.appendChild(element)
				
				// and then the label to the form.
				formElement.appendChild(label)
				
			}
			
			// if the MDD specified no title for the input, append the input to the form.
			else formElement.appendChild(element)
		
			inputs.push(element)
		
			// check for a callback function...
			if ( form.callback ) {
			
				// bind the callback to enter.
				util.addListener(element, 'keyup', function(e) {
				
					if ( e.keyCode === 13 ) form.callback(inputs)
				
				})
			
			}
		
		})
	
		// check for a callback specification.
		if ( typeof form.callback == 'function' ) {
		
			this.MDD.buttons = this.MDD.buttons || {}
		
			this.MDD.buttons[form.buttonName || "Submit"] = function() {
			
				form.callback(inputs)
			
			}
		
		}
	
		// append the form to the dialogue.
		this.dialogue.appendChild(formElement)
	
	}

	/**
	 * ModalDialogueButton
	 * @description creates a button.
	 * @param name (string) - the text for the button.
	 * @param callback (function) - the function to be executed when the button is clicked.
	 * @param context (object) - the context under which the callback should be executed. (defaults to window.)
	 */
	var ModalDialogueButton = function(name, callback, context) {
	
		var button = util.createElement({'tag' : 'button', 'inner' : name})
		
		util.addListener(button, 'click', (function(callback, context) {
		
			return function(e) {
		
				callback.call(context || ModalDialogue, e)
			
			}
		
		})(callback, context))
	
		return button
	
	}

	/**
	 * createButtons
	 * @description creates button elements for a dialogue.
	 * @param buttons (object) - object to define buttons.
	 */
	dialogueFromMDD.prototype.createButtons = function( buttons, buttonContainer ) {
	
		// create a container for the buttons.
		var buttonContainer = ( ( buttonContainer instanceof Element ) ) ? buttonContainer :  util.createElement({'tag' : 'div', 'customClass' : 'buttons', 'appendTo' : this.dialogue})
	
		// iterate the buttons.
		for ( var i in buttons ) {
		
			// name of the button and the callback that's called when the button is clicked.
			var name, callback
		
			var self = this
		
			// if the value of the object property is a function then set 
			// the callback that function and the name as the property.
			if ( typeof buttons[i] == 'function' ) name = i, callback = buttons[i]
			
			// if the value of the button property is an object then it should
			// have properties for the title and callback.
			else if ( typeof buttons[i] == 'object' ) name = buttons[i].title || buttons[i].name, callback = buttons[i].callback
		
			// if the value of the button property is a boolean then it is
			// indicated that the property should be replaced with a template
			// button definition.
			else if ( typeof buttons[i] == 'boolean' ) {
			
				// override the close button.
				if ( /close/i.test(i) ) {
				
					name = 'Close'
				
					callback = function() {
						
						ModalDialogue.close()
						
					}
				
				}
			
			} 
		
			// determine the context under which the callback is executed. (default to ModalDialogue.)
			var context = ( typeof buttons[i].context == 'object' ) ? buttons[i].context : ModalDialogue
		
			// create the button
			var button = ModalDialogueButton(name, callback, context)
		
			// append it to the container.
			if ( button ) buttonContainer.appendChild(button)
		
		}
	
	}

	/**
	 * ModalDialogue.
	 */
	var ModalDialogue = {}

	/**
	 * createSingle
	 * @description creates a simple dialogue from a Modal Dialogue Definition (MDD).
	 * @param MDD (object) - Modal Dialogue Definition.
	 */
	ModalDialogue.createSingle = function(MDD)
	{
	
		// set the animate in property.
		animateIn = ( MDD.animate && typeof MDD.animate.in !== 'undefined' ) ? MDD.animate.in : null
		
		// set the animate out property.
		animateOut = ( MDD.animate && typeof MDD.animate.out !== 'undefined' ) ? MDD.animate.out : null
	
		var dialogue = new dialogueFromMDD(MDD)
		
		this.open(dialogue)
		
	}

	/**
	 * createWizard
	 * @description Creates a dialogue that allows switching between panes. (Next/Prev)
	 * @param dialogues (array) - An array of MDDs, each MDD is a pane of its own.
	 */
	ModalDialogue.createWizard = function(dialogues, animate)
	{
		// index of the current dialogue.
		var index = 0
		
		// set the animate in property.
		animateIn = ( animate && typeof animate.in !== 'undefined' ) ? animate.in : null
		
		// set the animate out property.
		animateOut = ( animate && typeof animate.out !== 'undefined' ) ? animate.out : null

		// iterate the dialogues.
		dialogues.forEach(function(dialogue, i) {
		
			// check for buttons.
			if ( dialogue.buttons ) {
			
				// iterate the buttons.
				for ( var j in dialogue.buttons ) {
					
					// skip the button if it's not prev or next.
					if ( ! /(prev|next)/i.test(j) || typeof dialogue.buttons[j] !== 'boolean') continue
				
					// override prev or next.
					dialogue.buttons[j] = {
					
						// override name.
						'name' : (j == 'prev') ? 'Previous' : 'Next',
						
						// override callback function.
						'callback' : (function(name) {
							
							return function() {
								
								// remove the current dialogue.
								currentDialogue.removeNode(true)
								
								// increment or decrement the index based on the button that was pressed.
								index = ( name == 'prev' ) ? index - 1 : index + 1
								
								// set the current dialogue to point to the dialogue at the new index.
								currentDialogue = dialogues[index]
								
								// append the new dialogue to the overlay.
								overlay.appendChild(currentDialogue)
								
							}
							
						})(j)
					}
					
				}
			
			}
		
			// turn the MDD into an actual element structure.
			dialogues[i] = new dialogueFromMDD(dialogue)
		
		})
		
		this.open(dialogues[0])
	}

	/**
	 * createMultiView
	 * @description Creates a dialogue with a sidebar and views.
	 * @param MVD (object) - Defines the dialogue. (See documentation.)
	 */
	ModalDialogue.createMultiView = function(MVD)
	{
		// return false if the MVD is invalid.
		if ( typeof MVD !== 'object' ) return false
	
		// set the animate in property.
		animateIn = ( MVD.animate && typeof MVD.animate.in !== 'undefined' ) ? MVD.animate.in : null
		
		// set the animate out property.
		animateOut = ( MVD.animate && typeof MVD.animate.out !== 'undefined' ) ? MVD.animate.out : null
	
		/**
		 * NavigationItem
		 * @description creates a navigation item.
		 * @param name (string) - the name of the view.
		 * @param index (int) - the index of the view.
		 * @param callback (function) - the function called when the navigation item is clicked.
		 * @param context (object) - the context under which the callback is called.
		 */
		var NavigationItem = function(name, index, callback, context) {
		
			var item = util.createElement({
				'tag' : 'li',
				'inner' : name,
				'setAttributes' : {
					'data-viewIndex' : index
				}
			})
		
			util.addListener(item, 'click', (function() {
			
				return function() {
				
					callback.call(callback || window, index)
				
				}
			
			})())
		
			if ( index === 0 ) item.addClass('active')
		
			return item
		
		}
	
		/**
		 * switchView
		 * @description switches between views.
		 * @param i (int) - the index of the view to switch to.
		 */
		var switchView = function(i) {
		
			// remove the previous navigation item from the active list.
			navItems[index].removeClass('active')
		
			// set the index to the index of the new view.
			index = i
		
			// make the new navigation item active.
			navItems[index].addClass('active')
		
			// remove the current view.
			currentView.removeNode(true)
		
			// set the current view to the new index.
			currentView = views[i]
			
			// add the new current view.
			viewContainer.appendChild(currentView)
		
		}
	
		var dialogue, // root node.
			navigation,  // enables navigation between views.
			navItems = [], // array of navigation items.
			navigationList, // ordered list of navigation items.
			viewContainer, // contains the current view.
			currentView, // the current view element.
			title, // title for the dialogue. (inside of the navigation)
			buttonContainer, // container for buttons.
			views = [], // list of views.
			index = 0, // index of the current view.
			self = this

		dialogue = util.createElement({'tag' : 'div', 'id' : 'ModalDialogue', 'customClass' : 'sidebar'})

		navigation = util.createElement({'tag' : 'div', 'customClass' : 'navigation', 'appendTo' : dialogue})
		
		viewContainer = util.createElement({'tag' : 'div', 'customClass' : 'views', 'appendTo' : dialogue})
		
		if ( typeof MVD.title == 'string' ) title = util.createElement({'tag' : 'h1', 'inner' : MVD.title, 'appendTo' : navigation})

		navigationList = util.createElement({'tag' : 'ol', 'appendTo' : navigation})

		// set buttons.
		if ( typeof MVD.buttons == 'object') {
		
			// create a button container element.
			buttonContainer = util.createElement({'tag' : 'div', 'customClass' : 'buttons', 'appendTo' : viewContainer})
		
			// hijack the createButtons method used in creating a dialogue.
			dialogueFromMDD.prototype.createButtons(MVD.buttons, buttonContainer)
		
		}

		// set views.
		if ( MVD.views instanceof Array ) {
		
			MVD.views.forEach(function(MDD, i) {
			
				// check the MDD is valid
				if ( isValidMDD(MDD) ) {
				
					// remove and button specifications. (buttons should be specified in the MVD.)
					MDD.buttons && delete MDD.buttons
				
					// set the Id of the view.
					MDD.customId = 'ModalView' + (i + 1)
				
					// add the view class.
					MDD.customClass = 'view'
				
					// construct the dialogue.
					views.push(new dialogueFromMDD(MDD))
				
					var navItem = NavigationItem(MDD.navTitle || MDD.title, i, switchView, ModalDialogue)
				
					navItems.push(navItem)
				
					navigationList.appendChild(navItem)
				
				}
			
				else throw util.error('Invalid MDD - ' + i)
			
			})
		
		}
		
		else throw util.error('The MutiView Definition does not have any views.')

		// set the current view.
		currentView = views[0]

		// add the current view.
		viewContainer.appendChild(currentView)

		// open the view.
		this.open(dialogue, MVD.animate && MVD.animate.in)

		return dialogue

	}
	
	/**
	 * close
	 * @description removes the currently visible modal dialogue.
	 */
	ModalDialogue.close = function(){
	
		if ( AnimationPrefix && animateOut ) {
		
			new Animator(overlay, 'fadeOut', 0.5)
			
			new Animator(currentDialogue, animateOut, 0.5, function() {
				
				currentDialogue.removeNode(true)
				
				overlay.removeClass('visible')
				
			})
		}
		
		else {
		
			currentDialogue.removeNode(true)
			
			overlay.removeClass('visible')
		
		}
	
	}

	/**
	 * open
	 * @description Adds the dialogue to the overlay.
	 * @param dialogue (HTMLElement) - dialogue to add.
	 */
	ModalDialogue.open = function(dialogue)
	{
	
		// remove any dialogues that may already exist.
		overlay.removeChildren()
		
		// set the new currentDialogue.
		currentDialogue = dialogue
		
		// if there's a prefix then get the animation module.
		if ( animateIn ) {
		
			// add the dialogue to the overlay.
			overlay.appendChild(dialogue)
				
			// make the overlay visible.
			overlay.addClass('visible')
				
			// animate the overlay in.
			new Animator(overlay, 'fadeIn', 0.5)
				
			// animate the dialogue in.
			new Animator(dialogue, animateIn, 0.5)
						
		}
		else {
		
			overlay.appendChild(dialogue)
		
			overlay.addClass('visible')
		
		}
		
	}

	// globalise ModalDialogue.
	window.ModalDialogue = ModalDialogue

	})

})()