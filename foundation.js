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
 * removeNode
 * @description Removes a given node from the DOM.
 */
function removeNode(node){

	// mercilessly destroy the bitch.
	node.parentNode.removeChild(node);

}