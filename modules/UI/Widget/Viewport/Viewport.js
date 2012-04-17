/**
 * ViewportWidget
 * @description Creates a viewport and exposes methods for creating/destroying views and switching between views.
 */
define(['util','require','dependencies/EventEmitter'],function(util, require, EventEmitter){

	var Viewport = function(options){
	
		if ( typeof options !== 'object' )
		{
			this.emit('error', util.error("UIViewportWidget - Missing options object."));
			
			return false;
		}
	
		// set the HTMLElement to append the viewport node to.
		var parent = this.parent = ( options.appendTo instanceof Element ) ? options.appendTo : document.body;
	
		// create the viewport node.
		var node = this.node = util.createElement({'tag' : 'div', 'id' : 'ViewportWidget', appendTo : parent});
	
	}

	Viewport.prototype.switchView = function(n){}

	Viewport.prototype.destroyView = function(){}

	Viewport.prototype.clean = function(){}

	EventEmitter.augment(Viewport.prototype);

	return Viewport;

});