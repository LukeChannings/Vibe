/**
 * MusicMe Collection
 * @description Provides an interface for representing the MusicMe collection.
 */
define(['util','require','dependencies/EventEmitter','api/musicme','UI/Widget/TreeList'],function(util, require, EventEmitter, Api, TreeList){

	// include stylesheet.
	util.registerStylesheet(require.toUrl('./Collection.css'));
	
	// constructor.
	function Collection(options){
	
		// usual lark.
		var self = this;
	
		// make sure that options exists to prevent reference errors.
		var options = this.options = options || {};
	
		// make an Api instance.
		var api = this.api = new Api(settings.get('host'),settings.get('port'));
	
		// create the UICollection element.
		var element = this.element = document.createElement('div');
	
		// set the Id.
		element.setAttribute('id','UICollection');
	
		// append the element.
		(options.appendTo || document.body).appendChild(element);
	
		// set loading class.
		element.setAttribute('class','loading');
	
		// wait for the API to connect.
		api.once('ready',function(){
			
			element.removeAttribute('class');
			
			// determine the Api method.
			var method = ( /(artist|album|genre|track)/i.test(options.rootType) ) ? options.rootType : 'artist';
			
			self.populate(method);
			
		});
		
		// if the Api couldn't connect.
		api.once('error',function(){
		
			// log the error.
			console.log("UICollection failed to create an Api instance. Cannot continue.");
		
			// emit the error.
			self.emit('error','ERR_CONNECT');
		
		});
	
		// Drag And Drop
		// dropTarget element specified in UICollection options.
		// DnD methods:
		if ( options.dropTarget instanceof Element )
		{
		
			// dragstart.
			// triggered when a draggable item is dragged.
			self.dragStart = function(e){
			
				// set dnd mode.
				e.dataTransfer.dropEffect = 'copy';
			
				// determine the target node.
				var target = e.target || e.srcElement;
			
				// get the collection type.
				var type = target.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0];
				
				// get the id of the collection type.
				var id = target.getAttribute('data-id');
			
				e.dataTransfer.setData('Text', JSON.stringify({
					'id' : id,
					'type' : type
				}));
			
			}
		
			// dragover
			// triggered when the dragged item enters the drop target.
			util.addListener(options.dropTarget,'dragover',function(e){
				
				if (e.preventDefault) e.preventDefault();
				
				e.dataTransfer.effectAllowed = 'copy';
				
				return false;
				
			});
			
			// dragenter
			// triggered when the item enters the drop target.
			util.addListener(options.dropTarget,'dragenter',function(e){
			
				var target = e.target || e.srcElement;
			
				target.setAttribute('class','dragentered');
			
				return false;
			
			});
			
			// dragleave
			// triggered when the dragged item leaves the drop target.
			util.addListener(options.dropTarget,'dragleave',function(e){
				
				var target = e.target || e.srcElement;
				
				target.removeAttribute('class');
				
			});
			
			// drop
			// triggered when the dragged item is dropped within the drop target.
			util.addListener(options.dropTarget,'drop',function(e){
				
				var target = e.target || e.srcElement;
				
				target.removeAttribute('class');
				
				self.emit('drop',JSON.parse(e.dataTransfer.getData('Text')));
				
			});
			
		}
	
	}
	
	Collection.prototype.populate = function(method)
	{
		
		var self = this;
		
		// get the top level data..
		this.api['get' + method[0].toUpperCase() + method.slice(1) + 's'](function(data){
		
			// remap genre.
			if ( method == 'genre' )
			{
				data.forEach(function(genre){
					
					genre.name = genre.genre;
					
					genre.id = encodeURIComponent(genre.genre);
					
				});
			}
		
			if ( self.options.appendTo.getElementsByTagName('ol')[0] )
			{
				self.options.appendTo.getElementsByTagName('ol')[0].removeNode();
			}
			
			var options = {
				'appendTo' : self.element,
				'isRootNode' : true,
				'customClass' : method,
				'setAttributes' : []
			}
			
			if ( self.options.dropTarget instanceof Element )
			{
				options.setAttributes.push(['draggable','true']);
				options.dragStartMethod = self.dragStart;
			}
			
			// create the tree list.
			var list = new TreeList(data,options);
			
			// itemClicked
			// handles populating sub-items.
			list.on('itemClicked',function(item,isPopulated){
			
				if ( ! isPopulated )
				{
					// get the item id.
					var id = item.getAttribute('data-id');
				
					// get the parent class.
					var type = item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/);
				
					// determine the method.
					type = ( type[0] ) ? type[0] : 'artist';
				
					var options = {
						'appendTo' : item,
						'customClass' : self.api.getSubtype(type),
						'setAttributes' : []
					};
				
					if ( self.options.dropTarget instanceof Element )
					{
						options.setAttributes.push(['draggable','true']);
						options.dragStartMethod = self.dragStart;
					}
					
					if ( self.api.getMethodFor(type) )
					{
						self.api[self.api.getMethodFor(type)](id,function(items){
						
							new TreeList(items,options);
						
						});
					}
					else
					{
						self.emit('trackClicked',id);
					}
				
				}
			
			});
		
		});
		
	}
	
	// mixin EventEmitter.
	EventEmitter.augment(Collection.prototype);
	
	return Collection;

});