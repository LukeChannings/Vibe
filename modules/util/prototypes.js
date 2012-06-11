define(function() {

	/**
	 * Prototypes.
	 */
		
	// forEach.
	if ( typeof Array.prototype.forEach == "undefined" ) {
	
		Array.prototype.forEach = function(callback) {
		
			if ( typeof callback == "function" ) {
			
				for ( var i = 0; i < this.length; i++ ) {
				
					callback(this[i],i,this)
				}
			}
		}
	}
	
	// map shim.
	if ( ! Array.prototype.map ) {
	
		Array.prototype.map = function(f) {
		
			var arr = []
			
			this.forEach(function(item) {
				
				arr.push(f(item))
			})
			
			return arr
		}
	}
	
	// Array indexOf. (for IE <= 8)
	// From MDC - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
	if ( ! Array.prototype.indexOf) {
	
	  Array.prototype.indexOf = function(elt , from) {
	  
	    var len = this.length >>> 0;
	
	    var from = Number(arguments[1]) || 0
	    
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from)
	         
	    if (from < 0)
	      from += len;
	
	    for (; from < len; from++) {
	    
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  }
	}
	
	// setAttributes.
	if ( typeof Element.prototype.setAttributes == "undefined" ) {
	
		Element.prototype.setAttributes = function(attributes) {
			
			var self = this
				
			if ( attributes instanceof Array ) {
			
				attributes.forEach(function(attribute) {
					
					self.setAttribute(attribute[0],attribute[1])
				})
			}
			
			else if ( typeof attributes == "object" ) {
			
				for ( var i in attributes ) {
				
					self.setAttribute(i,attributes[i])
				}
			}
		}
	}
	
	// removeNode. (Overwrite existing prototypes. IE8 is gay.)
	if ( typeof  Element.prototype.removeNode == 'undefined') {
	
		Element.prototype.removeNode = function() {
		
			this.parentNode.removeChild(this)
		}
	}
	
	// removeChildren.
	if ( typeof Element.prototype.removeChildren == "undefined" ) {
	
		Element.prototype.removeChildren = function() {
		
			while ( this.firstChild ) {
			
				this.removeChild(this.firstChild)
			}
		}
	}
	
	// toggleClass.
	if ( typeof Element.prototype.toggleClass == "undefined" ) {
	
		Element.prototype.toggleClass = function(name) {
		
			var regex = new RegExp(name);
		
			if ( regex.test(this.className) ) {
			
				this.className = this.className.replace(name, '')
			}
			
			else {
			
				if ( this.className.length == 0 ) this.className = name
				
				else this.className += ' ' + name
			}
		}
	}
	
	// appendChildren
	if ( typeof Element.prototype.appendChildren == 'undefined' ) {
	
		Element.prototype.appendChildren = function(children) {
			
			var self = this
			
			children.forEach(function(child) {
			
				if ( child instanceof Element ) {
				
					self.appendChild(child)
				}
			})
		}
	}
	
	// addClass
	if ( ! Element.prototype.addClass ) {
	
		Element.prototype.addClass = function(className) {
		
			if ( this.className.length == 0 ) {
			
				this.className = className;
			}
			
			else if ( ! new RegExp('(^| )' + className + '( |$)').test(this.className) ) {
			
				this.className += ' ' + className;
			}
		
		}
	}

	// removeClass
	if ( ! Element.prototype.removeClass ) {
	
		Element.prototype.removeClass = function(className) {
		
			this.className = this.className.replace(new RegExp('( |^)' + className + '( |$)'),'')
		
			if ( this.className.length == 0 ) {
			
				this.removeAttribute('class')
			}
		
		}
	}
	
	// hasClass
	if ( ! Element.prototype.hasClass ) {
	
		Element.prototype.hasClass = function(className) {
		
			return new RegExp("(^| )" + className + "($| )").test(this.className)
		}
	}
	
	// console exception prevention.
	if ( ! window.console || ! window.console.log || ! window.console.warn || ! window.console.error ) {
	
		if ( ! window.console ) window.console = {}
		
		if ( ! console.log ) window.console.log = function() {}
		
		if ( ! console.warn ) window.console.warn = function() {}
		
		if ( ! console.error ) window.console.error = function() {} 
	}
	
	return true
})