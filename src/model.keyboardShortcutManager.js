/**
 * Binds keyboard shortcuts to actions in the interface.
 */
define(['util'], function( util ) {

	// constructor.
	// @param _vibe {Object} the vibe instance object.
	var KeyboardShortcutManager = function(_vibe) {

		var self = this

		self.bindings = {}

		util.addListener(window , 'keydown', function(e) {

			if ( self.bindings[e.keyCode] ) {

				util.forEach(self.bindings[e.keyCode], function( handler ) {
					handler.apply(_vibe, arguments)
				})
			}
		})
	}

	/**
	 * binds a function to a keyboard shortcut.
	 * @param _key {Integer|Array} the keyboard keyCode to bind. Can be an array of keyCodes.
	 * @param _handler {Function|Array} function to be called for this keyboard shortcut. Can be an array of handlers.
	 */
	KeyboardShortcutManager.prototype.bind = function(_key, _handler) {

		var

		// ensure _key and _handler are arrays.
		keys = ( Object.prototype.toString.apply(_key) === "[object Array]" ) ? _key : [_key],
		handlers = ( Object.prototype.toString.apply(_handler) === "[object Array]" ) ? _handler : [_handler],
		self = this

		// map all handlers to all keys.
		util.map(keys, function( key ) {
			util.map(handlers, function( handler ) {
				if ( Object.prototype.toString.apply(self.bindings[key]) === "[object Array]" ) {
					self.bindings[key].push(handler)
				} else {
					self.bindings[key] = [handler]
				}
			})
		})
	}

	/**
	 * removes a binding for a key and handler.
	 * @param key {Integer} the keyboard keyCode to bind.
	 * @param handler {Function} function to be called for this keyboard shortcut.
	 */
	KeyboardShortcutManager.prototype.unbind = function(key, handler) {

		if ( this.bindings[key] ) {

			delete this.bindings[key]
		}
	}

	return KeyboardShortcutManager
})