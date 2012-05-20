/**
 * Util.
 * @description Implements forEach, setAttributes, addListener, removeListener, removeNode and various tests.
 */
define(function(){

	/**
	 * Prototypes.
	 */
		
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
		
			this.className = this.className.replace(new RegExp('( |^)' + className + '( |$)'),'');
		
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
	var Util = {
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
		registerStylesheet : function(url, callback) {
		
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
				
				if ( typeof callback == 'function' ) {
				
					(function checkLoaded() {
					
						for ( var i = 0; i < document.styleSheets.length; i++ ) {
						
							if ( new RegExp(url).test(document.styleSheets[i].href) ) {
							
								callback()
								
								return;
							
							}
							
						}
					
						setTimeout(checkLoaded, 1)
					
					})()
				
				}
				
				window.registeredStylesheets.push(url);
			}
			
			else callback()
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
		
		},
		
		disableUserSelect : function(node) {
		
			this.addListener(node, 'selectstart', function(e) {
			
				if ( e.cancelBubble ) e.cancelBubble()
			
				e.returnValue = false
			
				if ( e.preventDefault ) e.preventDefault()
			
				if ( e.stopPropogation ) e.stopPropogation()
			
				return false
			
			})
		
		},
		
		augment : function(receiving, sending, context) {
		
			for ( var i in sending ) {
			
				if ( sending.hasOwnProperty(i) ) {
				
					if ( context ) {
					
						receiving[i] = (function(method, context) {
						
							return function() {
							
								method.call(context)
							
							}
						
						})(sending[i], context)
					
					}
					else receiving[i] = sending[i]
				
				}
			
			}
		
		}
	}

	return Util;

})