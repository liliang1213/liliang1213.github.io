"use strict";
var gObjectNum = 0;
function userControl(event) {
    var keycode;

    if (window.event) {// IE
        keycode = event.keyCode;
    } else if (event.which) {
        keycode = event.which;
    }

    //选择
    if (keycode >= 48 && keycode <= 57) {
        if (keycode - 48 < gEngine.Core.mAllObjects.length) {
            gObjectNum = keycode - 48;
        }
    }

    if (keycode === 38) { //上
        if (gObjectNum > 0) {
            gObjectNum--;
        }
    }
    if (keycode === 40) {//下
        if (gObjectNum < gEngine.Core.mAllObjects.length - 1) {
            gObjectNum++;
        }
    }

    // 移动
    if (keycode === 87) { //W
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(0, -10));
    }
    if (keycode === 83) { // S
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(0, +10));
    }
    if (keycode === 65) { //A
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(-10, 0));
    }
    if (keycode === 68) { //D
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(10, 0));
    }

    // 旋转
    if (keycode === 81) { //Q
        gEngine.Core.mAllObjects[gObjectNum].rotate(-0.1);
    }
    if (keycode === 69) { //E
        gEngine.Core.mAllObjects[gObjectNum].rotate(0.1);
    }

    // 去除重力
    if (keycode === 72) { //H
        if (gEngine.Core.mAllObjects[gObjectNum].mFix === 0)
            gEngine.Core.mAllObjects[gObjectNum].mFix = 1;
        else
            gEngine.Core.mAllObjects[gObjectNum].mFix = 0;
    }

    // 生成
    if (keycode === 70) {//f
        var r1 = new Rectangle(new Vec2(gEngine.Core.mAllObjects[gObjectNum].mCenter.x,
                gEngine.Core.mAllObjects[gObjectNum].mCenter.y),
                Math.random() * 30 + 10, Math.random() * 30 + 10);
    }
    if (keycode === 71) {//g
        var r1 = new Circle(new Vec2(gEngine.Core.mAllObjects[gObjectNum].mCenter.x,
                gEngine.Core.mAllObjects[gObjectNum].mCenter.y),
                Math.random() * 10 + 20);
    }

    //去除
    if (keycode === 82) { //R
        gEngine.Core.mAllObjects.splice(5, gEngine.Core.mAllObjects.length);
        gObjectNum = 0;
    }

}