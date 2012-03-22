define(function(){

	/**
	 * modalDialogue
	 * @description Creates a dialogue box and overlays it.
	 * @param MDO (object) - Modal Dialogue Object, used to define the dialogue.
	 */
	function ModalDialogue()
	{
		/** Append Stylesheet. **/
		var stylesheet = document.createElement("link");
		
		stylesheet.setAttribute("rel","stylesheet");
		
		stylesheet.setAttribute("type","text/css");
		
		stylesheet.setAttribute("href","modules/modalDialogue/modal.css");
		
		document.head.appendChild(stylesheet);
		
		/** Append overlay element. **/
		this.overlay = document.createElement("div");
		
		this.overlay.setAttribute("id","ModalDialogueOverlay");
		
		document.body.appendChild(this.overlay);
		
		// current dialogue.
		this.currentDialogue;
		
	}

	/**
	 * createDialogue
	 * @description Creates a simple single-view dialogue box.
	 * @param MDO (object) - The Modal Dialogue Object defines the content of the dialogue.
	 */
	ModalDialogue.prototype.createDialogue = function(MDO){
	
		var self = this;
	
		// make an array to keep a list of classes.
		var classes = ["visible"];
	
		// check that there is actually an MDO.
		if ( MDO )
		{
		
			// if there's not title or body then it's a pretty broken dialogue.
			if ( ! MDO.title && ! MDO.body )
			{
				// don't continue.
				return;
			}
		
			// make a dialogue element.
			var dialogue = this.currentDialogue = document.createElement("div");
	
			// give it the ID.
			dialogue.setAttribute("id","ModalDialogue");
			
			/* create a header. */
			var title = document.createElement("h1");
			
			// put the MDO title into the header.
			title.innerHTML = MDO.title;
			
			// append the header to the dialogue.
			dialogue.appendChild(title);
			
			/* Check the MDO body. */
			if ( MDO.body instanceof HTMLElement )
			{
				// if the body is an HTML Element then append it.
				dialogue.appendChild(MDO.body);
					
			}
			
			// if the MDO body is an array..
			else if ( MDO.body instanceof Array )
			{
				// iterate the array.
				for ( var i = 0; i < MDO.body.length; i++ )
				{
					// append each element to the innerHTML.
					dialogue.innerHTML += MDO.body[i];
				}
					
			}
			
			// if the body isn't anything special, just put it in the innerHTML.
			else dialogue.innerHTML += MDO.body;
			
			
			/* check for a form definition. */
			if ( MDO.form )
			{
				// add form to the classes.
				classes.push("form");
				
				// make a new form.
				var form = document.createElement("form");
				
				// set the form name.
				form.setAttribute("name",MDO.form.name);
				
				// set a default method. (For semantics.)
				form.setAttribute("method","post");
				
				for ( var i = 0; i < MDO.form.inputs.length; i++ )
				{
					if ( MDO.form.inputs[i].title )
					{ 
						// make a new label.
						var label = document.createElement("label");
					
						// give the label some text.
						label.innerHTML = MDO.form.inputs[i].title;
					}
					
					// make a new input.
					var input = document.createElement("input");
					
					// set the input name.
					if ( MDO.form.inputs[i].name ) input.setAttribute("name",MDO.form.inputs[i].name);
					
					// set the input type.
					if ( MDO.form.inputs[i].type ) input.setAttribute("type",MDO.form.inputs[i].type);
					
					// set the placeholder
					if ( MDO.form.inputs[i].placeholder ) input.setAttribute("placeholder",MDO.form.inputs[i].placeholder);
					
					// append the input.
					if ( label ){
						label.appendChild(input);
						form.appendChild(label);
					}
					else form.appendChild(input);
				}
				
				// append the form.
				dialogue.appendChild(form);
				
			}
			
			// check for button definitions.
			if ( MDO.buttons )
			{
				// loop through the buttons.
				for ( var i in MDO.buttons )
				{
					// make a button.
					var button = document.createElement("button");
					
					// if the member is a close button then create a close template.
					if ( i == "close" )
					{
						// give it a title.
						button.innerHTML = "Close";
						
						// close the dialogue when it's pressed.
						addListener(button,'click',function(){
						
							// yes, that means what it says.
							self.destroy();
						
						});
						
					}
					
					// check for an apply button.
					else if ( i == "apply" )
					{
						// set the button text.
						button.innerHTML = "Apply";
						
						// check that the callback is actually a function.
						if ( typeof MDO.buttons[i] == "function" )
						{
							// if it is then add a click listener.
							addListener(button,'click',MDO.buttons[i]);
						}
						
						// if there's no callback function then this button is pretty useless. :(
						else continue;
					
					}
					
					// check for a submit button.
					else if ( i == "submit" )
					{
						// set the text.
						button.innerHTML = "Save";
						
						// handle the submit event.
						addListener(button,'click',MDO.buttons.submit);
						
					}
					
					else
					{
						// if there's a generic button, let it title itself.
						button.innerHTML = i;
						
						// check if it has a callback.
						if ( typeof MDO.buttons[i] == "function" )
						{
							// if it does then listen for a click.
							addListener(button,'click',MDO.buttons[i]);
						}
						
						// if it doesn't.. screw it.
						else continue;
					
					}
					
					// add the button to the dialogue.
					dialogue.appendChild(button);
				}
				
			}
			
			if ( MDO.errorDialogue ) classes.push("error");
			
			self.overlay.appendChild(dialogue);
			
			self.overlay.setAttribute("class","visible");
			
			dialogue.setAttribute("class",classes.join(" "));
			
		}
		
		// if there's no MDO, log an error.
		else console.error("ModalDialogue::createDialogue - No MDO!");
	
	}
	
	ModalDialogue.prototype.createDialogueWithNavigation = function(MDO){}

	/**
	 * destroy
	 * @description Closes the dialogue.
	 */
	ModalDialogue.prototype.destroy = function(){
	
		// destroy the dialogue.
		removeNode(this.currentDialogue);
		
		// hide the overlay.
		this.overlay.removeAttribute("class");
	
	}
	
	// export the module.
	return ModalDialogue;

});