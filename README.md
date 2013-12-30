# Backbone Namespaced Events
[![Build Status](https://travis-ci.org/wheresrhys/backbone.namespaced-events.png)](https://travis-ci.org/wheresrhys/backbone.namespaced-events)


Backbone Namespaced Events implements the syntax of jQuery namespaced events (http://docs.jquery.com/Namespaced_Events) for Backbone's custom events implementation

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/wheresrhys/backbone.namespaced-events/master/dist/backbone.namespaced-events.min.js
[max]: https://raw.github.com/wheresrhys/backbone.namespaced-events/master/dist/backbone.namespaced-events.js

To use namespaced events instead of native ones on an obj use ``` Backbone.extend(obj, Backbone.NamespacedEvents);```

To use namespaced events on all Backbone Models, Collections etc... use ``` Backbone.NamespacedEvents.overwriteNativeEvents() ```. A copy of the native events object will still be available at ``` Backbone.NativeEvents ```


## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
