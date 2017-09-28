
define(function(require, exports, module) {
    require('./Common.js');
    require('./Engine.js');
    require('./Render.js');
    require('../Body.js');

    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
    console.info(Render, 'Render');
});