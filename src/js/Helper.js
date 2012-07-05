Function.prototype.enableEventsOnPrototype = function() {

        function getEvents(target, name) {
            var eventTypes = target.__eventTypes || (target.__eventTypes = {});
            var events = eventTypes[name] || (eventTypes[name] = []);
            return events;
        }
        
        var proto = this.prototype;
        
        proto.addEventListener = function(name, callback) {
                getEvents(this, name).push(callback);
            };
        
        proto.evokeEvent = function(name, eventArgs) {
                getEvents(this, name).forEach(function(callback) {
                        callback.call(this, callback);
                    });
    };


};

function __rand(number)
{
	return Math.floor(Math.random()*number);
}

function __newID()
{
	return "__ID" + (__newID.__key += __newID.__step);
}

__newID.__key = __rand(100000) + 99999;
__newID.__step = __rand(300) + 1;

Object.prototype.__addElem = function(nodeName, innerText)
{
	var dest = this.ownerDocument.createElement(nodeName);
	dest.id = __newID();
	if(innerText)
		dest.innerHTML = innerText;
	this.appendChild(dest);
	return dest;
}

function getElement(id)
{
	return document.getElementById(id);
}

function __enableEvents(classObject)
{
	classObject.prototype.addEventListener = function(name, func)
	{
		if(this.__events == undefined)
			this.__events = [];
		
		if(this.__events[name] == undefined)
			this.__events[name] = [];
		this.__events[name].push(func);
	}
	
	classObject.prototype.evokeEvent = function(name, args)
	{
		if(this.__events != undefined && this.__events[name] != undefined)
		{
			var handlers = this.__events[name];
			for(var i = 0; i < handlers.length; i++)
				handlers[i](args);
		}
	}
}

Object.prototype.addEventHandler = function(eventName, handlerObject, handlerFunctionName, useCapture)
{
	var x = this;
	this.addEventListener(eventName, function(event) {handlerObject[handlerFunctionName](x, event); }, useCapture);
}

Object.prototype.addClass = function(name)
{
	this.className += " " + name;
}

Object.prototype.removeClass = function(name)
{
	var padded = " " + this.className + " ";
	padded = padded.replace(" " + name + " ", " ");
	
	if(padded.length > 1)
		this.className = padded.substring(1, padded.length - 1);
	else
		this.className = "";
}

function __isFunc(func)
{
	return func != undefined && func.call != undefined;
}

function __isArr(arr)
{
	return arr != undefined && arr.length != undefined;
}

Function.prototype.inheritsFrom = function(parentClass)
{
	this.prototype = new parentClass;
	this.prototype.constructor = this;
	this.prototype.parent = parentClass.prototype;
	return this;
}