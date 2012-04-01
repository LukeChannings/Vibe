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
	if ( typeof HTMLElement.prototype.setAttributes == "undefined" )
	{
		HTMLElement.prototype.setAttributes = function(attributes){
			
			if ( attributes instanceof Array )
			{
				
				var self = this;
				
				attributes.forEach(function(attribute){
				
					self.setAttribute(attribute[0],attribute[1]);
				
				});
			}
			
		}
	}
	
	// removeNode.
	if ( typeof HTMLElement.prototype.removeNode == "undefined" )
	{
		HTMLElement.prototype.removeNode = function()
		{
			this.parentNode.removeChild(this);
		}
	}
	
	// removeChildren.
	if ( typeof HTMLElement.prototype.removeChildren == "undefined" )
	{
		HTMLElement.prototype.removeChildren = function()
		{
			while ( this.firstChild )
			{
				this.removeChild(this.firstChild);
			}
		}
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
		addStylesheet : function(url){
		
			document.head.appendChild(function(){
			
				var link = document.createElement('link');
			
				link.setAttributes([['rel','stylesheet'],['type','text/css'],['href',url]]);
			
				return link;
			
			}());
		
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