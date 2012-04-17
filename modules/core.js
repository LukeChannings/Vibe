/**
 * MusicMe
 * @description Official MusicMe Web App.
 */

// requirejs configuration.
require.config({
	baseUrl: './modules/',
	paths: {
		'dep' : './dependencies'
	}
});

require(['dep/domReady','settings','util','UI/Widget/Viewport/Viewport'], function (domReady,Settings,util,ViewportWidget) {

	viewport = new ViewportWidget();

});