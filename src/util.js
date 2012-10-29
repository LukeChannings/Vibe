// Utility methods for Vibe.
// basic methods for DOM manipulation, events, stylesheet loading, browser testing, etc.
define({

	// run a callback for each item in an array.
	// @param array {Array} the array to iterate.
	// @param callback {function} called for each element.
	// @param done {function} called when all elements have been iterated.
	forEach : function(array, callback, done) {
	
		if ( this.isArray(array) && typeof callback == "function" ) {
		
			for ( var i = 0; i < array.length; i += 1 ) {
			
				callback(array[i], i, array)
			}
			
			if ( typeof done == 'function' ) {
				done()
			}
		}
	},

	// map an array to mutate create a new array.
	// @param array {Array} the array to operate on.
	// @param callback {function} the function to return a new array element.
	map : function(array, callback) {
	
		var arr = []
		
		for ( var i = 0; i < array.length; i += 1 ) {
		
			arr.push(callback(array[i]))
		}

		return arr
	},

	// map an object.
	// @param obj {Object} the object to map.
	// @param callback {Function} the function to be called for each property.
	mapObject : function(obj, callback) {

		var arr = []

		for ( var i in obj ) {

			arr.push(callback(i, obj[i]))
		}

		return arr
	},

	// set attributes on a DOM node.
	// @param node {HTMLElement} the node on which to add the attributes.
	// @param attributes {object|Array} the object that defines the attributes.
	setAttributes : function(node, attributes) {
	
		if ( node && attributes ) {
		
			if ( this.isArray(attributes) ) {
			
				this.forEach(attributes, function(attribute) {
					
					node.setAttribute(attribute[0], attribute[1])
				})
			}
			
			else if ( typeof attributes == "object" ) {
			
				for ( var i in attributes ) {
				
					node.setAttribute(i, attributes[i])
				}
			}
		}
	},

	// construct a DOM node.
	// @param definition {object} properties of the element to be constructed.
	createElement : function(definition) {
	
		// check the definition has a tag.
		if ( typeof definition != 'object' || !definition.tag ) {
		
			// if there is no object/tag then return false.
			return void(0)
		}
		
		// create the DOM node.
		var node = document.createElement(definition.tag),
			self = this
		
		// set the inner html.
		if ( typeof definition.inner == 'string' ) {
		
			node.innerHTML = definition.inner
		}
		
		// set an Id.
		if ( definition.id ) {
			
			node.setAttribute('id', definition.id)
		}
		
		// set a class.
		if ( definition.className ) {
		
			node.setAttribute('class', definition.className)
		}
		
		// check for attributes.
		if ( definition.attributes ) {
		
			this.setAttributes(node, definition.attributes)
		}
		
		// check for children.
		if ( definition.children && this.isArray(definition.children) ) {
		
			this.forEach(definition.children, function(child) {
			
				child.appendTo = node
				
				self.createElement(child)
			})
		}
		
		// check if we're appending the element.
		if ( definition.appendTo && definition.appendTo instanceof Element ) {
		
			definition.appendTo.appendChild(node)
		}
		
		return node
	},

	// add event listener
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
	
	// remove event listener.
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
	
	// add a class to a DOM node.
	// @param node {HTMLElement} the element to add the class to.
	// @param className {string} the name of the class to add.
	addClass : function(node, className) {
	
		if ( node.className.length == 0 ) {
		
			node.className = className;
		}
		
		else if ( ! new RegExp('(^| )' + className + '( |$)').test(node.className) ) {
		
			node.className += ' ' + className;
		}
	},
	
	// remove a class from a DOM node.
	// @param node {HTMLElement} the element to remove the class from.
	// @param className {string} the name of the class to remove.
	removeClass : function(node, className) {
	
		node.className = node.className.replace(new RegExp('( |^)' + className + '( |$)'),'')
		
		if ( node.className.length == 0 ) {
		
			node.removeAttribute('class')
		}
	},
	
	// check that the node has a given class.
	// @param node {HTMLElement} the element to check.
	// @param className {string} the class to check for.
	hasClass : function(node, className) {
	
		return new RegExp("(^| )" + className + "($| )").test(node.className)
	},
	
	// toggle a class on a node.
	// @param node {HTMLElement} the node to toggle the class on.
	// @param className {string} the class to toggle.
	toggleClass : function(node, className) {
	
		var regex = new RegExp(className);
	
		if ( regex.test(node.className) ) {
		
			node.className = node.className.replace(className, '')
		}
		
		else {
		
			if ( node.className.length == 0 ) {
				node.className = className
			} else {
				node.className += ' ' + className
			}
		}
	},
	
	// remove a node from the DOM.
	// @param node {HTMLElement} object reference for the node.
	removeNode : function(node) {
	
		if ( node && this.inDOMTree(node) ) {

			try {
				if ( 'removeNode' in node ) {
					node.removeNode(true)
					
				} else {
				
					node.parentNode.removeChild(node)
				}
			} catch (ex) {
			
				throw ex
			}
		}
	},
	
	// remove the children of a node.
	// @param node {HTMLElement} object reference for the node that we're removing the children of.
	removeChildren : function(node) {
	
		if ( node && node.firstChild ) {

			while ( node.firstChild ) {
			
				this.removeNode(node.firstChild)
			}
		}
	},
	
	// adds every html element in an array (or array-like object) to the given DOM node.
	// @param node {HTMLElement} object reference to the DOM node.
	// @param children {Array} list of DOM nodes to append.
	appendChildren : function(node, children) {
	
		if ( children.hasOwnProperty('length') && node instanceof Element ) {
		
			for ( var i = 0; i < children.length; i += 1 ) {
			
				if ( children[i] instanceof Element ) {
				
					node.appendChild(children[i])
				}
			}
		}
		
		else {
		
			return false
		}
	},
	
	//
	// adds the properties of one object to another object.
	// @param receiving {object} the object that will have the properties added.
	// @param sending {object} the object that has properties to be applied.
	// @param context {object} the object that the properties of the sending object will be called under.
	//
	augment : function(receiving, sending, context) {
	
		for ( var i in sending ) {
		
			if ( sending.hasOwnProperty(i) ) {
			
				if ( context ) {
				
					receiving[i] = (function(method, context) {
						return function() {
							method.call(context)
						}
					})(sending[i], context)
				
				} else {
					receiving[i] = sending[i]
				}
			}
		}
	},
	
	
	// load a stylesheet asynchronously
	// @param url {string} url of the stylesheet.
	// @param callback {function} (optional) function called once the stylesheet has loaded.
	registerStylesheet : (function() {
	
		// object to keep track of loaded stylesheets.
		var stylesheets = {},
			_self = this
		
		// verifies the existence of a resource
		// Note: will only work when the resource
		// is accessible via XHR.
		var verifyResource = function(url, callback) {
		
			var XHR = new XMLHttpRequest()
			
			XHR.open('get', url)
			XHR.send()
			XHR.onreadystatechange = function() {
			
				if ( XHR.readyState == 4 ) {
				
					if ( /^(0|404$)/.test(XHR.status) || XHR.responseText.length == 0 ) {
						
						callback(false)
					}
					else {
					
						callback(true)
					}
				}
			}
		}
		
		// executes a callback when the 
		// stylesheet link with the given
		// url is loaded.
		var StylesheetObserver = function(url, callback) {
		
			var timeout = 0,
			
			self = this,
			
			checker = function() {
			
				for ( var i = 0; i < document.styleSheets.length; i += 1 ) {
				
					if ( new RegExp(url + '$').test(document.styleSheets[i].href) ) {
					
						self.reference = document.styleSheets[i]
					
						callback(document.styleSheets[i])
						
						return
					}
				}
				
				if ( timeout <= 100 ) {
				
					setTimeout(function() {
						checker()
					}, 50)
				} else {
				
					callback(false)
				}
			}
		
			this.url = url
			this.callback = callback
		
			checker()
		}
	
		var _registerStylesheet = function(url, callback) {
		
			if ( url in stylesheets ) {
			
				return false
			}
			
			var link = document.createElement('link'),
				callback = ( typeof callback == 'function' ) ? callback : function(loaded) {
				
					var message = ( loaded ) ? "Loaded resource: " + url + " successfully" : "Failed to load " + url
					
				}
			
			link.setAttribute('href', url)
			link.setAttribute('type', 'text/css')
			link.setAttribute('rel', 'stylesheet')
			
			document.getElementsByTagName('head')[0].appendChild(link)
			
			stylesheets[url] = new StylesheetObserver(url, function (ref) {
			
				if ( ! ref ) {
				
					callback(false)
					
					return
				}
			
				var numberOfRules = null
			
				try {
					
					numberOfRules = ref.cssRules.length
				}
				catch (error) {
					
					numberOfRules = null
				}
				finally {
				
					if ( numberOfRules ) {
					
						callback(true)
					}
					else if ( numberOfRules != null ) {
						
						callback(false)
					}
					else {
					
						verifyResource(url, function(exists) {
						
							callback(exists)
						})
					}
				}
			})
		}
		
		_registerStylesheet.hasBeenRegistered = function(url) {
		
			return stylesheets[url]
		}
	
		return _registerStylesheet
	
	})(),
	
	// cache an image.
	cacheImage : function(url) {
	
		var image = new Image()
		
		image.src = url
	
	},
	
	// formats a time in seconds to a time in 00:00 format.
	// @param seconds {number} number of seconds.
	formatTime : function(seconds) {
	
		// round.
		seconds = Math.ceil(seconds)
	
		// minutes.
		var minutes = Math.floor(seconds / 60)
		
		var seconds = seconds % 60
		
		if ( String(minutes).length == 1 ) {
			minutes = '0' + String(minutes)
		}
		
		if ( String(seconds).length == 1 ) {
			seconds = '0' + String(seconds)
		}
		
		return minutes + ':' + seconds
	
	},
	
	// expands a time in seconds to time in hours, minutes and seconds.
	// @param seconds {number} number of seconds.
	expandTime : function(duration) {
	
		var seconds = parseInt(duration % 60, 10),
			minutes = parseInt(duration / 60, 10),
			hours = ( minutes >= 60 ) ? parseInt(minutes / 60, 10) : 0,
			stringSeconds,
			stringMinutes,
			stringHours,
			result

		if ( hours > 0 ) {
			minutes = parseInt(minutes % 60, 10)
		}

		if ( hours ) {
		
			stringHours = hours + " hour"
		
			if ( hours > 1 ) {
				stringHours += "s"
			}
		}
		
		if ( minutes ) {
			stringMinutes = minutes + " minute"
		
			if ( minutes > 1 ) {
				stringMinutes += "s"
			}
		}
		
		if ( seconds ) {
			stringSeconds = seconds + " second"
		
			if ( seconds > 1 ) {
				stringSeconds += "s"
			}
		}
		
		if ( stringHours && stringMinutes && stringSeconds ) {
			result = stringHours + ", " + stringMinutes + " and " + stringSeconds + "."
		} else if ( stringHours && stringMinutes && ! stringSeconds ) {
			result = stringHours + " and " + stringMinutes + "."
		} else if ( stringHours && ! stringMinutes && stringSeconds ) {
			result = stringHours + " and " + stringSeconds + "."
		} else if ( stringHours && ! stringMinutes && ! stringSeconds ) {
			result = stringHours + "."
		} else if ( ! stringHours && stringMinutes && stringSeconds ) {
			result = stringMinutes + " and " + stringSeconds + "."
		} else if ( ! stringHours && stringMinutes && ! stringSeconds ) {
			result = stringMinutes + "."
		} else if ( ! stringHours && ! stringMinutes && stringSeconds ) {
			result = stringSeconds + "."
		}
		
		return result
	},

	// replaces & < > £ characters with HTML entities.
	htmlEntities : function(string) {

		return string.replace(/&/g,'&#38;').replace(/</g,'&#60;').replace(/>/g,'&#62;').replace(/£/g,'&#163;')
		
	},
	
	// gets the metadata content from a given meta tag name.
	// @param name {string} name of the meta element.
	getMetaContent : function(name) {
	
		var metaTags = document.getElementsByTagName('meta')
	
		for ( var i = 0; i < metaTags.length; i += 1 ) {
		
			if ( metaTags[i].getAttribute('name') == name ) {
				return metaTags[i].getAttribute('content')
			}
		}
		
		return false
	
	},
	
	// prevents user selection of an text element.
	// @param node {HTMLElement} the element to prevent selection for.
	disableUserSelect : function(node) {
	
		node.setAttribute('unselectable', 'on')

		node.style.cursor = "default"

		this.addListener(node, 'selectstart', function(e) {
		
			if ( e.cancelBubble ) {
				e.cancelBubble()
			}
		
			e.returnValue = false
		
			if ( e.preventDefault ) {
				e.preventDefault()
			}
		
			if ( e.stopPropogation ) {
				e.stopPropogation()
			}
			
			return false
		
		})
	
	},
	
	// checks if an object has a set of methods. (duck typing method.)
	// @param obj {Object} the object to test.
	// @param protocol {array} a list of method names.
	hasProtocol : function(obj, protocol) {
	
		if ( typeof obj !== 'object' ) {
			
			return false
		}
	
		for ( var i = 0; i < protocol.length; i += 1 ) {
		
			if ( typeof obj[protocol[i]] !== 'function' ) {
				return false
			}
		}
		
		return true
	},
	
	// checks if the object has a set of properties. (duck typing method.)
	// @param obj {Object} the object to test.
	// @param properties {Array} a list of property names.
	hasProperties : function(obj, properties) {
	
		if ( typeof obj !== 'object' ) {
			
			return false
		}
	
		for ( var i = 0; i < properties.length; i += 1 ) {
		
			if ( typeof properties[i] == 'string' && ! obj.hasOwnProperty(properties[i]) ) {
			
				return false
			}

			if ( typeof obj[properties[i]] === "undefined" ) {

				return false
			}
		}
		
		return true
	},
	
	// returns the index of a given node.
	indexOfNode : function(node) {
	
		if ( node ) {
			var list = node.parentNode
			
			for ( var i = 0; i < list.childNodes.length; i += 1 ) {
			
				if ( node == list.childNodes[i] ) {
				
					return i
					
					break
				}
			}
		}
	},
	
	// updates the browser's favicon.
	updateShortcutIcon : function(url, previousIcon) {
	
		// if there is no previous node, then get it from the DOM.
		if ( previousIcon ) {
			this.removeNode(previousIcon)
		}
		
		// make a new link.
		return this.createElement({
			tag : 'link',
			attributes : {
				rel : "shortcut icon",
				href : url,
				type : "text/png"
			},
			appendTo : document.getElementsByTagName('head')[0]
		})
	},
	
	// returns true if the parameter is an array.
	isArray : Array.prototype.isArray || function(value) {
	
		return Object.prototype.toString.call(value) === '[object Array]'
	},
	
	// translates an array's properties into a new position.
	// @param array {Array} the array to mutate.
	// @param indexes {Array} a list of indexes within the array to translate.
	// @param position {Number} the index to translate the indexes to.
	// @param reverse {Boolean} if true the order of items will be in reverse order.
	translateObjectProperties : function(array, indexes, position, reverse) {
	
		for ( var i = 0; i < indexes.length; i += 1 ) {
		
			array.splice(
				reverse ? position : position + i,
				0,
				array.splice(indexes[i], 1)[0]
			)
		}
	},

	// returns true if a given node is in the DOM tree.
	inDOMTree : function(element) {

	    while (element = element.parentNode) {

	        if (element === document) {

	            return true
	        }
	    }

	    return false
	},
	
	// translates a node's children into a new configuration.
	// @param parentNode {HTMLOLElement} an ordered list.
	// @param group {Array} a list of indexes or Elements within the list to translate.
	// @param reference {Element|Number} the html element or index of an element to be used as an insertion reference.
	translateNodePositions : function(parentNode, group, reference) {
	
		if ( typeof reference == 'number' ) {
			reference = parentNode.childNodes[reference]
		}
	
		// turn a list of indexes into a list
		// of nodes. If this is not done the
		// position of the items in the list
		// will be inaccurate.
		group = group.map(function(item) {
		
			if ( typeof item == 'number' ) {
				return parentNode.childNodes[item]
			} else {
				return item
			}
		})
	
		for ( var i = 0; i < group.length; i += 1 ) {
		
			parentNode.insertBefore(
				group[i],
				reference
			)
		}
	},
	
	// browser tests
	browser : {
	
		// simple test to check if the browser identifies itself as mobile. 
		// (It's browser detection, but the only option sadly.)
		isMobile : (function() {

			return /(iPhone|Android|Mobile)/i.test(navigator.userAgent)		
		})(),
		
		// returns true if the browser identifies itself as Internet Explorer.
		isIE : (function() {
		
			return /MSIE/i.test(navigator.userAgent)
		
		})(),
		
		// returns true if the browser is IE 8.
		isIE8 : (function() {
		
			return /MSIE 8\.0/i.test(navigator.userAgent) 
		
		})(),
		
		// object containing support tests for the browser.
		hasSupport : {
		
			// returns true if the browser supports drag and drop elements,
			// specifically draggable elements. Note: IE will fail, but does
			// have limited support for drag and drop.
			dragAndDrop : (function() {
			
				return ( 'draggable' in document.createElement('div') )
			})(),
			
			// returns true if the browser supports SVG images.
			svg : (function() {
			
				// check for SVG support.
				var support = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")
			
				// disable SVG on Opera and IE due to poor implementation.
				if ( /opera/i.test(navigator.userAgent) || /MSIE/i.test(navigator.userAgent) ) {
					support = false
				}
			
				return support
			})(),
			
			// if the browser supports CSS3 transitions this method will return the
			// vendor prefix used in CSS transitions. Otherwise it will return false.
			cssTransitions : (function() {
		
				// possible prefixes.
				var prefix = ["transition", "WebkitTransition", "MozTransition", "OTransition", "msTransition"]
				
				// loop through possibilities.
				for ( var i = 0; i < prefix.length; i += 1 ) {
				
					// check if the possibility is present, if so, return the property that was found.
					if ( prefix[i] in document.createElement('div').style ) {
						return prefix[i].replace('Transition','')
					}
				}
				
				// if no possibilities match then transitions are unsupported, return false.
				return false;
			})(),
			
			// returns true if the browser supports local storage.
			localStorage : (function() {
			
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
			})()
		}
	}
})