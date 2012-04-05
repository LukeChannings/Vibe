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
	
	// removeNode.
	if ( typeof Element.prototype.removeNode == "undefined" )
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
	
	// Array indexOf. (for IE <= 8)
	// From MDC - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
	if (!Array.prototype.indexOf)
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
	
	/**
	 * Util Object.
	 */
	var Util = {
		addListener : function(element,listenFor,callback){
		
			if ( document.addEventListener )
			{
				element.addEventListener(listenFor,callback,false);
			}
			else
			{
				element.attachEvent('on' + listenFor, callback);
			}
		
		},
		removeListener : function(element,listenFor,dispatch){
		
			if ( document.removeEventListener )
			{
				element.removeEventListener(listenFor,dispatch,false);
			}
			else
			{
				element.detachEvent(listenFor,dispatch);
			}
		
		},
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
						if ( prefix[i] in document.createElement('div').style ) return prefix[i];
					
					}
					
					// if no possibilities match then transitions are unsupported, return false.
					return false;
				}
			}
		}
	}

	return Util;

});