Backbone Namespaced Events
---

Backbone Namespaced Events implements the syntax of jQuery namespaced events (http://docs.jquery.com/Namespaced_Events) for Backbone's custom events implementation

To use namespaced events instead of native ones on an obj use ``` Backbone.extend(obj, Backbone.NamespacedEvents);```

To use namespaced events on all Backbone Models, Collections etc... use ``` Backbone.NamespacedEvents.overwriteNativeEvents() ```. A copy of the native events object will still be available at ``` Backbone.NativeEvents ```

More docs, use cases, greater test coverage and performance benchmarks to follow.                                             

