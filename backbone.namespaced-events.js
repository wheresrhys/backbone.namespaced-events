/**
 * Backbone-namespaced-events.js 0.1
 * (c) 2012 Rhys Evans
 * 
 * Backbone-namespaced-events may be freely distributed under the MIT license; see the accompanying LICENSE.txt.
 * For details and documentation: https://github.com/PaulUithol/Backbone-relational.
 * Depends on Backbone (and thus on Underscore as well): https://github.com/documentcloud/backbone.
 */
( function( undefined ) {
	"use strict";
	return;
	/**
	 * CommonJS shim
	 **/
	var _, Backbone, exports;
	if ( typeof window === 'undefined' ) {
		_ = require( 'underscore' );
		Backbone = require( 'backbone' );
		exports = module.exports = Backbone;
	}
	else {
		_ = window._;
		Backbone = window.Backbone;
		exports = window;
	}
	
	
  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/,
	namespaceSplitter = ':';
	
  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  // 
  // Overwrites Backbone's native Events implementation
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {
      var calls, eventComponents, event, list;
      if (!callback) return this;

      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      while (eventComponents = events.shift()) {
		eventComponents = eventComponents.indexOf(namespaceSplitter) > 0 ? eventComponents.split(namespaceSplitter) : [eventComponents];
		list = calls;
		while (event = eventComponents.shift()) {
			list = list[event] || (list[event] = {__callbacks__: []});
		}
		list.__callbacks__.push(callback, context);
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, eventComponents, calls, list, i, length;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return this;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      events = events ? events.split(eventSplitter) : _.keys(calls);

     // Loop through the callback list, splicing where appropriate.
	  while (eventComponents = events.shift()) {
		eventComponents = eventComponents.indexOf(namespaceSplitter) > 0 ? eventComponents.split(namespaceSplitter) : [eventComponents];
		list = calls;
		while (event = eventComponents.shift()) {
			if (!(list = list[event]) || !(callback || context)) {
				delete list[event];
				continue;
			}
			list = list[event];
		}
		for (i = 0, length = list.length; i < length; i += 2) {
			if (!(callback && list.__callbacks__[i] !== callback || context && list.__callbacks__[i + 1] !== context)) {
				list.__callbacks__.splice(i, 2);
			}
		}
      }
 

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, eventComponents, calls, list, i, length, args, all, rest;
      if (!(calls = this._callbacks)) return this;

      rest = [];
      events = events.split(eventSplitter);
      for (i = 1, length = arguments.length; i < length; i++) {
        rest[i - 1] = arguments[i];
      }

      // For each event, walk through the list of callbacks twice, first to
      // trigger the event, then to trigger any `"all"` callbacks.
	 while (eventComponents = events.shift()) {
		eventComponents = eventComponents.indexOf(namespaceSplitter) > 0 ? eventComponents.split(namespaceSplitter) : [eventComponents];
		list = calls;
		if (all = list.all) all = all.slice();
		
		while (event = eventComponents.shift()) {
			// Copy callback lists to prevent modification.
			if (list = list[event]) {
				list = list.__callbacks__.slice();
			} else {
				break;
			}
		}
		// Execute event callbacks.
		if (list) {
			for (i = 0, length = list.length; i < length; i += 2) {
				list[i].apply(list[i + 1] || this, rest);
			}
		}

		// Execute "all" callbacks.
		if (all) {
			args = [event].concat(rest);
			for (i = 0, length = all.length; i < length; i += 2) {
				all[i].apply(all[i + 1] || this, args);
			}
		}
	 }
      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

	
	_.extend(Model.prototype, Events);
	_.extend(Collection.prototype, Events);
	_.extend(Router.prototype, Events);
	_.extend(History.prototype, Events);
	
})();