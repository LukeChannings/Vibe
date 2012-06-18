define(function() {

	/**
	 * Util Object.
	 */
	var Util = {
		addListener : (function() {
		
			if ( document.addEventListener ) {
			
				return function(element,listenFor,callback) {
				
					element.addEventListener(listenFor, callback, false)
				}
			}
			else {
			
				return function(element,listenFor,callback) {
				
					element.attachEvent('on' + listenFor, callback)
				}
			}
		
		})(),
		removeListener : (function() {
		
			if ( document.removeEventListener ) {
			
				return function(element,listenFor,dispatch) {
				
					element.removeEventListener(listenFor,dispatch,false)
				}
			}
			
			else {
			
				return function(element,listenFor, dispatch) {
				
					element.detachEvent(listenFor, dispatch)
				}
			}
		
		})(),
		registerStylesheet : function(url, callback) {
		
			if ( ! window.registeredStylesheets ) window.registeredStylesheets = []
		
			if ( window.registeredStylesheets.indexOf(url) == -1) {
			
				document.getElementsByTagName("head")[0].appendChild(function() {
				
					var link = document.createElement('link')
				
					link.setAttributes({
						'rel' : 'stylesheet',
						'type' : 'text/css',
						'href' : url
					});
				
					return link;
				
				}())
				
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
				
				window.registeredStylesheets.push(url)
			}
			
			else callback()
		},
		Browser : {
			isMobile : function() {
			
				// simple test to check if the browser identifies itself as mobile. 
				// (It's browser detection, but the only option sadly.)
				return /(iPhone|Android|Mobile)/i.test(navigator.userAgent)
			
			},
			isIE : function() {
			
				return /MSIE/i.test(navigator.userAgent)
			
			},
			HasSupport : {
				dragAndDrop : function() {
				
					// check for draggable attribute in a <div>.
					return ( 'draggable' in document.createElement('div') )
				},
				svg : function() {
				
					// check for SVG support.
					var support = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")
				
					// disable SVG on Opera due to poor implementation.
					if ( /opera/i.test(navigator.userAgent) ) support = false
				
					return support
				},
				cssTransitions : function() {
			
					// possible prefixes.
					var prefix = ["transition", "WebkitTransition", "MozTransition", "OTransition", "msTransition"]
					
					// loop through possibilities.
					for ( var i = 0; i < prefix.length; i++ ) {
					
						// check if the possibility is present, if so, return the property that was found.
						if ( prefix[i] in document.createElement('div').style ) return prefix[i].replace('Transition','')
					
					}
					
					// if no possibilities match then transitions are unsupported, return false.
					return false;
				},
				localStorage : function() {
				
					try {
					
						if ( window.localStorage ) {
						
							return true
						}
						else {
							return false
						}
						
					}
					catch (ex) {
						
						return ex
						
					}
				
				}
			}
		},
		
		htmlEntities : function(string) {

			return string.replace(/&/g,'&#38;').replace(/</g,'&#60;').replace(/>/g,'&#62;').replace(/£/g,'&#163;')
			
		},
		
		// doubleClick
		// handles simultaneous click events allowing for separate functions
		// to be used for a single click and a double click. Standard timeout 
		// is 170ms, otherwise the timeout can be set in settings using the 
		// 'clickTimeout' key.
		doubleClick : function(element,click,doubleClick, clickTimeoutDuration) {
		
			this.addListener(element,'click',function(e) {
			
				var target = e.target || e.srcElement
			
				if ( typeof clickTimeout == 'undefined' ) {
				
					clickTimeout = setTimeout(function() {
					
						clickTimeout = undefined
						
						if ( typeof click == 'function' ) click(target)
					
					}, clickTimeoutDuration || 170)
				}
				
				else {
		
					clearTimeout(clickTimeout)
					
					clickTimeout = undefined
					
					doubleClick(target)
				}
			
			});
		
		},
		
		cacheImage : function(url) {
		
			var image = new Image()
			
			image.src = url
		
		},
		
		formatTime : function(seconds) {
		
			// round.
			seconds = Math.ceil(seconds)
		
			// minutes.
			var minutes = Math.floor(seconds / 60)
			
			var seconds = seconds % 60
			
			if ( String(minutes).length == 1 ) minutes = '0' + String(minutes)
			
			if ( String(seconds).length == 1 ) seconds = '0' + String(seconds)
			
			return minutes + ':' + seconds
		
		},
		
		createElement : function(def) {
		
			var self = this
		
			// check that the definition is an object and contains a tag property.
			if ( typeof def == 'object' && def.hasOwnProperty('tag') ) {
			
				// create an element.
				var element = document.createElement(def.tag)
				
				// set inner.
				if ( typeof def.inner == 'string' ) element.innerHTML = def.inner
				
				// set an Id.
				if ( def.id ) element.setAttribute('id',def.id)
				
				// set a class.
				if ( def.customClass ) element.setAttribute('class',def.customClass)
				
				// check for custom attributes.
				if ( def.setAttributes ) element.setAttributes(def.setAttributes)
				
				// check for children.
				if ( def.children && def.children instanceof Array ) {
				
					def.children.forEach(function(child) {
					
						child.appendTo = element
					
						self.createElement(child)
					
					})
				}
				
				// check if we're appending the element.
				if ( def.appendTo && def.appendTo instanceof Element ) {
				
					def.appendTo.appendChild(element)
				}
				
				return element
				
			}
			
			// return false if there is no definition.
			else return false;
		
		},

		error : function(message, type) {
		
			var error = new Error()
		
			error.message = message || 'Unknown error.'
		
			error.type = type
		
			return error
		
		},
		
		getMetaContent : function(name) {
		
			var metaTags = document.getElementsByTagName('meta')
		
			for ( var i = 0; i < metaTags.length; i++ ) {
			
				if ( metaTags[i].getAttribute('name') == name ) return metaTags[i].getAttribute('content')
			}
			
			return false
		
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
		
		},
		
		implementsProtocol : function(obj, methodNames) {
		
			for ( var i = 0; i < methodNames.length; i++ ) {
			
				if ( typeof obj[methodNames[i]] !== 'function' ) return false
			}
			
			return true
		}
	}
	
	return Util
})