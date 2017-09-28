"use strict";
function userControl(event) {
    var keycode;
    var width = gEngine.Core.mWidth;
    var height = gEngine.Core.mHeight;
    var context = gEngine.Core.mContext;
    if (window.event) { // IE
        keycode = event.keyCode;
    } else if (event.which) {
        keycode = event.which;
    }
    if (keycode === 70) {    //f    创建一个长方形
        context.strokeRect(Math.random() * width * 0.8,
                Math.random() * height * 0.8,
                Math.random() * 30 + 10, Math.random() * 30 + 10);
    }
    if (keycode === 71) {   //g     创建一个圆形
        context.beginPath();
        context.arc(Math.random() * width * 0.8,
                Math.random() * height * 0.8,
                Math.random() * 30 + 10, 0, Math.PI * 2, true);
        context.closePath();
        context.stroke();
    }
}