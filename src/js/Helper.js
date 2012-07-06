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