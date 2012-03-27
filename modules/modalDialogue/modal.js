define(["require"],function(require){

	// include stylesheet resource.
	var stylesheet = document.createElement('link');

	stylesheet.setAttribute('type','text/css');

	stylesheet.setAttribute('rel','stylesheet');

	stylesheet.setAttribute('href',require.toUrl("./modal.css"));

	document.head.appendChild(stylesheet);
	
	var mobileStylesheet = document.createElement('link');
	
	mobileStylesheet.setAttribute('media','screen and (max-device-width: 480px)');
	
	mobileStylesheet.setAttribute('rel','stylesheet');
	
	mobileStylesheet.setAttribute('type','text/css');
	
	mobileStylesheet.setAttribute('href',require.toUrl("./modal.mobile.css"));
	
	document.head.appendChild(mobileStylesheet);
	
	/**
	 * modalDialogue
	 * @description Creates a dialogue box and overlays it.
	 * @param MDO (object) - Modal Dialogue Object, used to define the dialogue.
	 */
	function ModalDialogue(util)
	{
		// check for an existing modal dialogue.
		if ( ! document.getElementById('ModalDialogueOverlay') )
		{
			// create the overlay.
			this.overlay = document.createElement('div');
			
			// give it the id.
			this.overlay.setAttribute('id','ModalDialogueOverlay');
			
			// append it to the body.
			document.body.appendChild(this.overlay);
		}
		else
		{
			// if there is already an overlay then use that.
			this.overlay = document.getElementById('ModalDialogueOverlay');
		}
		
		// using removeListener, addListener and removeNode. (If using standalone, implement your own to save importing everything.)
		this.util = util;
	}
	
	/**
	 * close
	 * @description Externally accessible method for removing the current dialogue.
	 */
	ModalDialogue.prototype.close = function(){
	
		// delete the dialogue.
		this.overlay.removeChild(this.overlay.children[0]);
	
		// hide the overlay.
		this.overlay.removeAttribute('class');
	
	}
	
	/** 
	 * isValidMDO
	 * @description Returns true if the MDO meets the minimum requirements.
	 * @param MDO (object) - The MDO to test.
	 */
	function isValidMDO(MDO)
	{
		// make sure the MDO is actually an object.
		if ( typeof MDO == "object" && !( MDO instanceof Array) )
		{
			// check for a title and body.
			if ( ! MDO.title || ! MDO.body ) return false;
			
			// check if the MDO is part of a wizard.
			if ( MDO.isWizardDialogue )
			{
				// check for buttons.
				if ( ! MDO.buttons ) return false;
				else
				{
					// if there is no previous button, next button or close button then the user cannot escape.
					if ( ! MDO.buttons.next && ! MDO.buttons.prev && ! MDO.buttons.close ) return false;
					
				}
			}
			
			return true;
		}
	
	}
	
	/**
	 * addDialogue
	 * @description Makes the element visible.
	 * @param dialogue (HTMLElement) - dialogue to add.
	 * @param overlay (HTMLElement) - the overlay.
	 * @param animation (string) - name of the animation. (slideTop, slideBottom, fade.)
	 * @param util - (object) - object containing utility methods.
	 */
	function addDialogue(dialogue,overlay,animation,util)
	{
	
		// check for existing dialogues.
		if ( overlay.children.length >= 1 )
		{
			// remove them.
			util.removeNode(overlay.children[0]);
		}
		
		// check for an animation setting.
		if ( typeof animation == "string" && 
			/(slideTop|slideBottom|fade)/.test(animation) &&
			util.Browser.HasSupport.cssTransitions() &&
			! util.Browser.isMobile() )
		{
		
			var transition = util.Browser.HasSupport.cssTransitions();
		
			// animate overlay appearance.
			overlay.style.opacity = 0;
		
			overlay.style[transition] = "opacity 0.5s linear";
		
			// slideTop/Bottom.
			if ( /slide/.test(animation) )
			{
				dialogue.style.marginTop = ( animation == "slideTop" ) ? "-100%" : "100%";
				
				dialogue.style[transition] = "margin-top 0.5s linear";
				
				overlay.setAttribute('class','visible');
				
				overlay.appendChild(dialogue);
				
				setTimeout(function(){
				
					overlay.style.opacity = 1;
				
					dialogue.style.marginTop = "10%";
				
				}, 1);
				
			}
			
			// fade.
			if ( animation == "fade" )
			{
				
				dialogue.style.opacity = 0;
				
				dialogue.style[transition] = "opacity 0.2s linear";
				
				overlay.setAttribute('class','visible');
				
				overlay.appendChild(dialogue);
				
				setTimeout(function(){
				
					overlay.style.opacity = 1;
				
					dialogue.style.opacity = 1;
				
				},1);
				
			}
			
		}
		else
		{
			
			// append the new dialogue.
			overlay.appendChild(dialogue);
			
			// show the dialogue.
			overlay.setAttribute('class','visible');
			
		}
	}
	
	function removeDialogue(dialogue,overlay,animation,util)
	{
		
		util.removeNode(dialogue);
		
		overlay.style.opacity = 0;
		
		overlay.removeAttribute('class');
		
	}
	
	/**
	 * createDialogueElement
	 * @description Creates a dialogue element from an MDO.
	 * @param MDO (object) - The Modal Dialogue Object.
	 */
	function createDialogueElement(MDO,overlay,util)
	{
	
		// usual lark.
		var self = this;
	
		this.util = util;
	
		// check for a dialogue specification.
		if ( isValidMDO(MDO) )
		{
		
			// check for an overlay element.
			if ( overlay ) this.overlay = overlay;
		
			// create the dialogue element.
			var dialogue = this.dialogue = document.createElement("div");
			
			// determine the id for the dialogue.
			var dialogueId = ( MDO.customId ) ? MDO.customId : "ModalDialogue";
			
			// set the id.
			dialogue.setAttribute("id",dialogueId);
		
			// keep dialogue classes here.
			var classes = ['visible'];
		
			// check if this is an error dialogue
			if ( MDO.errorDialogue ) classes.push('error');
		
			// check for custom alignment specification.
			if ( MDO.alignment && /^(center|right|justify)$/.test(MDO.alignment) )
			{
				// set centre or right alignment.
				classes.push(MDO.alignment);
			}
		
			/* DIALOGUE HEADER */
			var title = document.createElement('h1');
				
			// put the MDO title into the header.
			title.innerHTML = MDO.title;
				
			// append the header to the dialogue.
			dialogue.appendChild(title);
		
			/* DIALOGUE BODY */
			if ( !(MDO.body instanceof Array) )
			{
				// if not, just put the element into an array to keep compatibility.
				MDO.body = [MDO.body];
			}
			
			// loop through body elements.
			for ( var i = 0; i < MDO.body.length; i++ )
			{
					
				// check if the item is an HTMLElement.
				if ( MDO.body[i] instanceof HTMLElement )
				{
					// if it is, append the element to the dialogue.
					dialogue.appendChild(MDO.body[i]);
				}
					
				// otherwise check if the element is a string.
				else if ( typeof MDO.body[i] == "string" )
				{
					// if the text does not have tags then wrap it in a <p>.
					if ( !( /\<.+\>.*\<.+\>/.test(MDO.body[i]) ) ) MDO.body[i] = "<p>" + MDO.body[i] + "</p>";
				
					// if the element is a string then add it directly.
					dialogue.innerHTML += MDO.body[i];
				}
			}
			
			/* DIALOGUE FORM */
			if ( MDO.form )
			{
				// add form to the classes.
				classes.push('form');
				
				// make a new form.
				var form = document.createElement('form');
				
				// set the form name.
				form.setAttribute('name',MDO.form.name);
				
				// set a default method. (For semantics.)
				form.setAttribute('method','post');
				
				for ( var i = 0; i < MDO.form.inputs.length; i++ )
				{
					if ( MDO.form.inputs[i].title )
					{ 
						// make a new label.
						var label = document.createElement('label');
					
						// give the label some text.
						label.innerHTML = MDO.form.inputs[i].title;
					}
					
					if ( MDO.form.inputs[i].type && MDO.form.inputs[i].type == "select" )
					{
						var input = document.createElement("select");
						
						for ( var j = 0; j < MDO.form.inputs[i].options.length; j++ )
						{
							var option = document.createElement("option");
							
							option.setAttribute('value',MDO.form.inputs[i].options[j]);
							
							option.innerHTML = MDO.form.inputs[i].options[j];
							
							input.appendChild(option);
						}
						
						if (  MDO.form.inputs[i].placeholder )
						{
							input.value =  MDO.form.inputs[i].placeholder;
						}
						
					}
					else
					{
						// make a new input.
						var input = document.createElement('input');
						
						// check for the form name.
						if ( MDO.form.inputs[i].name )
						{
							input.setAttribute("name", MDO.form.inputs[i].name);
						}
						else
						{
							input.setAttribute("name" + "input" + (i + 1));
						}
						
						// check for a type.
						if ( MDO.form.inputs[i].type )
						{
							input.setAttribute("type",MDO.form.inputs[i].type);
						}
						else
						{
							// if no type was specified default to "text"
							input.setAttribute("type","text");
						}
						
						// check for placeholder text.
						if ( MDO.form.inputs[i].placeholder )
						{
							// check for native placeholder support. (The good browsers do this.)
							if ( "placeholder" in input )
							{
								input.setAttribute('placeholder',MDO.form.inputs[i].placeholder);
							}
							
							// implement our own placeholder. (Because IE9 still sucks donkey dick.)
							else
							{
								// set the placeholder.
								input.value = MDO.form.inputs[i].placeholder;
							
								// set the placeholder.
								input.setAttribute('placeholder',MDO.form.inputs[i].placeholder);
							
								// listen for the input to be clicked.
								self.util.addListener(input,'focus',function(e){
									
									var target = e.target || e.srcElement;
									
									if ( target.getAttribute('placeholder') == target.value )
									{
										target.value = "";
									}
									
								});
								
								// listen for the blur event.
								self.util.addListener(input,'blur',function(e){
								
									var target = e.target || e.srcElement;
								
									if ( target.value == "" )
									{
										target.value = target.getAttribute('placeholder');
									}
								
								});
							}
						}
					}
					
					
					// if the MDO specified an input title..
					if ( label )
					{
						// append the input to the label
						label.appendChild(input);
						
						// and then the label to the form.
						form.appendChild(label);
						
					}
					
					// if the MDO specified no title for the input, append the input to the form.
					else form.appendChild(input);
				}
				
				// append the form.
				dialogue.appendChild(form);
				
			}
		
			/* DIALOGUE BUTTONS */
			if ( MDO.buttons )
			{
				// create the button container.
				var buttonContainer = document.createElement('div');
			
				// set the class.
				buttonContainer.setAttribute('class','buttons');
			
				// loop through the buttons.
				for ( var i in MDO.buttons )
				{
					// make a button.
					var button = document.createElement('button');
					
					// if a close button is specified, create a close button.
					if ( /close/i.test(i) && ! ( typeof MDO.buttons[i] == "function") )
					{
						// give it a title.
						button.innerHTML = 'Close';
						
						if ( typeof MDO.buttons[i] == "function" )
						{
							
							self.util.addListener(button,'click',function(){
							
								// yes, that means what it says.
								MDO.buttons[i].call(self);
							
							});
							
						}
						else
						{
							// close the dialogue when it's pressed.
							self.util.addListener(button,'click',function(){
							
								// fix removal bug for wizard dialogues.
								if ( MDO.isWizardDialogue ) self.dialogue = self.dialogue.parentNode;
								
								// yes, that means what it says.
								self.close();
							
							});
						}
					}
					else if ( typeof MDO.buttons[i] == "object" )
					{
					
						button.innerHTML = MDO.buttons[i].title || i;
					
						if ( typeof MDO.buttons[i].callback == "function" )
						{
						
							if ( MDO.isWizardDialogue )
							{
								var index = parseInt(MDO.customId.match(/\d/)[0]);
								
								if ( i == "next" )
								{
									self.util.addListener(button,'click',function(e){
									
										MDO.buttons.next.callback.call(MDO.buttons.next.callbackContext,e,index);
									
									});
								}
								if ( i == "prev" ) {
								
								self.util.addListener(button,'click',function(e){
								
									MDO.buttons.prev.callback.call(MDO.buttons.prev.callbackContext,e,index);
								
								});
								
								}
								
							}
							else
							{
								self.util.addListener(button,'click',MDO.buttons[i].callback);
							}
						}
					
					}
					// check if it has a callback.
					else if ( typeof MDO.buttons[i] == 'function' )
					{
					
						// if there's a generic button, let it title itself.
						button.innerHTML = i;
					
						// if it does then listen for a click.
						self.util.addListener(button,'click',function(){
						
							MDO.buttons[i].call(self);
						
						});
						
					}
					
					// if it doesn't.. screw it.
					else continue;
					
					// add the button to the dialogue.
					buttonContainer.appendChild(button);
				}
				
				// if there are actually buttons...
				if ( buttonContainer.children.length != 0 )
				{
					// append the container.
					dialogue.appendChild(buttonContainer);
				}
				
				// if there are no buttons, close the container.
				else buttonContainer = null;
			}
		
			/* DIALOGUE CLASSES */
			if ( MDO.class )
			{
				// check for an array of classes.
				if ( MDO.class instanceof Array )
				{
					classes = MDO.class.concat(classes);
				}
				
				else if ( typeof MDO.class == "string" )
				{
					classes.push(MDO.class);
				}
				
			}
			
			// set the dialogue classes.
			dialogue.setAttribute('class', classes.join(' '));
		
			// return the constructed dialogue.
			return dialogue;
		}
		else
		{
			throw {
				"message" : "The specified MDO is invalid.",
				"name" : "MDO_FAULT"
			};
		}
		
		// if there is no dialogue specification return nothing.
		return null;
	}

	createDialogueElement.prototype.close = function(){
	
		removeDialogue(this.dialogue,this.overlay,null,this.util);
	}
	
	/**
	 * createDialogue
	 * @description Creates a simple single-view dialogue box.
	 * @param MDO (object) - The Modal Dialogue Object defines the content of the dialogue.
	 */
	ModalDialogue.prototype.createDialogue = function(MDO)
	{
		// check that there is actually an MDO.
		if ( isValidMDO(MDO) )
		{
		
			var dialogue = new createDialogueElement(MDO,this.overlay,this.util);
			
			addDialogue(dialogue,this.overlay,MDO.animateIn || null,this.util);
			
		}
		
		// if there's no MDO, log an error.
		else console.error('ModalDialogue::createDialogue - No MDO!');
	
	 return this;
	
	}
	
	/**
	 * createWizard
	 * @description Creates a dialogue that allows switching between panes. (Next/Prev)
	 * @param MDOArray (Array) - An array of MDOs, each MDO is a pane of its own.
	 */
	ModalDialogue.prototype.createWizard = function(MDOArray,animateIn){
		
		// usual lark.
		var self = this;
		
		// check for existing dialogues.
		if ( this.overlay.children.length >= 1 )
		{
			// remove them.
			self.util.removeNode(this.overlay.children[0]);
		}
		
		// array to store the dialogue panes in.
		var panes = [];
			
		// the parent dialogue element.
		var wizard = document.createElement('div');
			
		// make the wizard the ModalDialogue.
		wizard.setAttribute('id','ModalDialogue');
		
		// loop through the MDOs.
		for ( var i = 0; i < MDOArray.length; i++ )
		{
			// inject a custom id for the MDO.
			MDOArray[i].customId = "WizardDialogue" + (i + 1);
					
			// specify that the MDO is a wizard dialogue view.
			MDOArray[i].isWizardDialogue = true;
			
			// check that the MDO is valid.
			if ( ! isValidMDO(MDOArray[i]) )
			{
				// log any error.
				console.error("MDO " + (i + 1) + " is invalid.");
				
				// break out.
				return;
			
			}
			
			// check for a next button.
			if ( typeof MDOArray[i].buttons.next == "boolean" )
			{
				// add template specification.
				MDOArray[i].buttons.next = {
					"title" : "Next",
					"callback" : function(e,i){
						
						// remove the current pane.
						self.util.removeNode(wizard.children[0]);
						
						// add the next pane.
						wizard.appendChild(panes[i]);
							
					},
					"callbackContext" : this // cannot be used externally.
				}
			}
					
			// check for a previous button.
			if ( typeof MDOArray[i].buttons.prev == "boolean" )
			{
				// add template specification.
				MDOArray[i].buttons.prev = {
					"title" : "Previous",
					"callback" : function(e,i){
					
						// remove the current pane.
						self.util.removeNode(wizard.children[0]);
						
						// add the previous pane.
						wizard.appendChild(panes[i - 2]);
					
					},
					"callbackContext" : this // cannot be used externally.
				}
			
			}
				
			// create the dialogue.
			var dialogue = new createDialogueElement(MDOArray[i],this.overlay,this.util);
			panes.push(dialogue);
				
		}
			
		// put the first dialogue in the wizard.
		wizard.appendChild(panes[0]);
		
		addDialogue(wizard,this.overlay,animateIn || null,this.util);
		
	}
	
	/**
	 * createDialogueWithSidebar
	 * @description Creates a dialogue with a sidebar and views.
	 * @param dialogueDefinition (object) - Defines the dialogue. (See documentation.)
	 */
	ModalDialogue.prototype.createDialogueWithSidebar = function(dialogueDefinition){
	
		var self = this;
	
		// check for existing dialogues.
		if ( this.overlay.children.length >= 1 )
		{
			// remove them.
			self.util.removeNode(this.overlay.children[0]);
		}
	
		// check for the dialogue definition.
		if ( dialogueDefinition )
		{
			// create the dialogue.
			var dialogue = document.createElement('div');
			dialogue.setAttribute('id','ModalDialogue');
			dialogue.setAttribute('class','sidebar');
			
			// create the navigation sidebar.
			var nav = document.createElement('div');
			nav.setAttribute('class','navigation');
			
			// create the navigation items container.
			var navItems = document.createElement('ol');
			
			// create the view container.
			var viewContainer = document.createElement('div');
			viewContainer.setAttribute('class','views');
			
			// create an array to contain view elements.
			var views = this.views = [];
			
			// set the current view index.
			var currentViewIndex = this.currentViewIndex = 0;
			
			// append the nav and view container to the dialogue.
			dialogue.appendChild(nav);
			dialogue.appendChild(viewContainer);
			
			// check for a title.
			if ( dialogueDefinition.title )
			{
				// create the title and append it to nav..
				var title = document.createElement('h1');
				title.innerHTML = dialogueDefinition.title;
				nav.appendChild(title);
			}
			
			// check for views.
			if ( dialogueDefinition.views )
			{
			
				// implement view switcher.
				function switchView(e){
				
					var t = e.target || e.srcElement;
				
					// make sure we're not already on this view.
					if ( ! ( currentViewIndex == t.getAttribute('data-viewIndex') ) )
					{
						// close the current view.
						self.util.removeNode(views[currentViewIndex]);
						
						// append the specified view.
						viewContainer.appendChild(views[parseInt(t.getAttribute('data-viewIndex'))]);
						
						navItems.children[currentViewIndex].removeAttribute('class');
						
						// set currentView.
						currentViewIndex = parseInt(t.getAttribute('data-viewIndex'));
						
						navItems.children[currentViewIndex].setAttribute('class','active');
						
					}
				
				}
			
				// check that there are views.
				if ( dialogueDefinition.views.length == 0 ) 
				{
					// if there are not then log an error.
					console.error("dialogueDefinition has no views. Cannot continue.");
					
					// break out.
					return false;
				}
				
				// loop views.
				for ( var i = 0; i < dialogueDefinition.views.length; i++ )
				{
					// check the view is valid.
					if ( isValidMDO(dialogueDefinition.views[i]) )
					{
						// add the ModalView id.
						dialogueDefinition.views[i].customId = "ModalView" + (i + 1);
						
						// add the view class.
						dialogueDefinition.views[i].class = "view";
						
						// check for button definitions.
						if ( dialogueDefinition.views[i].buttons )
						{
							// remove buttons from the MDO. (createDialogueWithSidebar does not allow per-view buttons.)
							delete dialogueDefinition.views[i].buttons;
						}
						
						// create the view.
						var view = createDialogueElement(dialogueDefinition.views[i],this.overlay,this.util);
						
						// set view index.
						view.setAttribute('data-viewIndex',i);
						
						// push the view to the views array.
						views.push(view);
						
						// check for a navigation title.
						var navItem = document.createElement('li');
							
						navItem.innerHTML = dialogueDefinition.views[i].navTitle || dialogueDefinition.views[i].title ;
							
						navItem.setAttribute('data-viewIndex',i);
							
						self.util.addListener(navItem,'click',function(e){
								
							switchView.call(self,e);
								
						});
							
						if ( i == 0 ) navItem.setAttribute('class','active');
							
						navItems.appendChild(navItem);
					}
					else
					{
						console.error("Invalid view. Choked on DMO " + (i + 1));
						
						return false;
						
					}
				}
				
				viewContainer.appendChild(views[0]);
			}
			
			// check for buttons.
			if ( dialogueDefinition.buttons )
			{

				var buttonContainer = document.createElement('div');
			
				buttonContainer.setAttribute('class','buttons');
			
				for ( var i in dialogueDefinition.buttons )
				{
					
					var button = document.createElement('button');
				
					if ( i == "close" && typeof dialogueDefinition.buttons[i] !== "function"  )
					{
						button.innerHTML = "Close";
						
						self.util.addListener(button,'click',function(){
						
							self.close();
						
						});
						
					}
					else
					{
						button.innerHTML = i;
						
						if ( typeof dialogueDefinition.buttons[i] == "function" )
						{
							self.util.addListener(button,'click',function(e){
								
								dialogueDefinition.buttons[i].call(self,e);
							
							});
						}
					}
					
					buttonContainer.appendChild(button);
					
				}
				
				viewContainer.appendChild(buttonContainer);
			}
			
			// append the dialogue to the overlay.
			this.overlay.appendChild(dialogue);
			this.overlay.setAttribute('class','visible');
			
			// append the navItems.
			nav.appendChild(navItems);
			
			addDialogue(dialogue,this.overlay,dialogueDefinition.animateIn || null,this.util);
			
			// return the dialogue.
			return dialogue;
		}
		
		// if there is no definition, return false.
		else return false;
	}
	
	// export the module.
	return ModalDialogue;

});