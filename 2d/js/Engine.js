var Engine = {};

define('Engine',function(require, exports, module) {

    Engine.create = function(element, options) {
        options = Common.isElement(element) ? options : element;
        element = Common.isElement(element) ? element : null;
        options = options || {};


        var defaults = {
        };

        var engine = Common.extend(defaults, options);

        // @deprecated
        if (element || engine.render) {
            var renderDefaults = {
                element: element,
                controller: Render
            };

            engine.render = Common.extend(renderDefaults, engine.render);
        }

        // @deprecated
        if (engine.render && engine.render.controller) {
            engine.render = engine.render.controller.create(engine.render);
        }

        // @deprecated
        if (engine.render) {
            engine.render.engine = engine;
        }

        engine.world = options.world || createWorld(engine.world);
        return engine;
    };

    var createWorld=function(options){
        var defaults = {
            label: 'World',
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            },
            bounds: {
                min: { x: -Infinity, y: -Infinity },
                max: { x: Infinity, y: Infinity }
            }
        };

        return Common.extend({}, defaults, options);
    }

    module.exports = Engine;
});