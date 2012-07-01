function PlayerSelector(container, player)
{
	this.__buttons = [];
	this.__mode = "human";
	
	var modes = ["Human", "Easy", "Medium", "Hard", "Expert"];
	container.__addElem("h2", player);
	var list = container.__addElem("table");
	this.__player = player;
	var row = list.__addElem("tr");
	var id = __newID();
	for(var i = 0; i < modes.length; i ++)
	{
		var item = row.__addElem("td");
		var button = item.__addElem("button", modes[i]);
		button.__value = modes[i].toLowerCase();
		button.addEventHandler("click", this, "onClick", false);
		this.__buttons.push(button);
		
		if(i == 0)
			button.className = "checked";
	}
}

__enableEvents(PlayerSelector);

PlayerSelector.prototype.getMode = function()
{
	return this.__mode;
}

PlayerSelector.prototype.onClick = function(sender, eventArgs)
{
	var value = sender.__value;
	for(var i = 0; i < this.__buttons.length; i++)
		if(this.__buttons[i].__value == value)
			this.__buttons[i].className = "checked";
		else
			this.__buttons[i].className = "";
	
	if(value == this.__mode)
		return;
	
	var oldValue = this.__mode;
	this.__mode = value;
	
	this.onValueChanged({newMode: this.__mode, oldMode: oldValue});
}

PlayerSelector.prototype.onValueChanged = function(eventArgs)
{
	this.evokeEvent("valuechanged", eventArgs);
}