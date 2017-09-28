var Common = {};

define('Common',function(require, exports, module) {

    Common._nextId = 0;
    Common._seed = 0;
    Common._nowStartTime = +(new Date());

    /**
     * 对象扩展方法.
     * @method extend
     * @param {} obj
     * @param {boolean} deep
     * @return {} obj extended
     */
    Common.extend = function (obj, deep) {
        var argsStart,
            args,
            deepClone;

        if (typeof deep === 'boolean') {
            argsStart = 2;
            deepClone = deep;
        } else {
            argsStart = 1;
            deepClone = true;
        }

        for (var i = argsStart; i < arguments.length; i++) {
            var source = arguments[i];

            if (source) {
                for (var prop in source) {
                    if (deepClone && source[prop] && source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], deepClone, source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }

        return obj;
    };

    /**
     * 检查是否为DOM元素.
     * @method isElement
     * @param {object} obj
     * @return {boolean}
     */
    Common.isElement = function(obj) {
        return obj instanceof HTMLElement;
    };

    Common.logLevel = 1;

    Common.log = function() {
        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
            console.log.apply(console, ['log:'].concat(Array.prototype.slice.call(arguments)));
        }
    };

    Common.info = function() {
        if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
            console.info.apply(console, ['info:'].concat(Array.prototype.slice.call(arguments)));
        }
    };

    Common.warn = function() {
        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
            console.warn.apply(console, ['warn:'].concat(Array.prototype.slice.call(arguments)));
        }
    };
    module.exports = Common;
});