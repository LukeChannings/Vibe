/**
 * addListener
 * @description Cross-browser addEventListener.
 */
function addListener(element,listenFor,callback){

	if ( document.addEventListener )
	{
		element.addEventListener(listenFor,callback,false);
	}
	else
	{
		element.attachEvent('on' + listenFor, callback);
	}

}

/**
 * removeListener
 * @description Cross-browser removeEventListener.
 */
function removeListener(element,listenFor,dispatch){

	if ( document.removeEventListener )
	{
		element.removeEventListener(listenFor,dispatch,false);
	}
	else
	{
		element.detachEvent(listenFor,dispatch);
	}

}

/**
 * removeNode
 * @description Removes a given node from the DOM.
 */
function removeNode(node){

	// mercilessly destroy the bitch.
	node.parentNode.removeChild(node);

}