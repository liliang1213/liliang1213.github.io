if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
        return window.setTimeout(callback, 17 /*~ 1000/60*/);
    });
}

utils = {};

utils.getScreenSize = function () {
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    return {
        w: w,
        h: h
    };
}

utils.captureMouse = function (element) {
    var mouse = {x: 0, y: 0, event: null};

    element.addEventListener('mousemove', function (event) {
        var x, y;

        x = event.clientX
        y = event.clientY
        mouse.x = x;
        mouse.y = y;
        mouse.event = event;
    }, false);

    return mouse;
};

utils.parseColor = function (color, toNumber) {
    if (toNumber === true) {
        if (typeof color === 'number') {
            return (color | 0);
        }
        if (typeof color === 'string' && color[0] === '#') {
            color = color.slice(1);
        }
        return window.parseInt(color, 16);
    } else {
        if (typeof color === 'number') {
            color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
        }
        return color;
    }
};
