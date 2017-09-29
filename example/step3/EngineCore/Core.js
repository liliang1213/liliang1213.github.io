"use strict";

var gEngine = gEngine || {};

gEngine.Core = (function () {
    var mCanvas, mContext, mWidth = 800, mHeight = 450;
    mCanvas = document.getElementById('canvas');
    mContext = mCanvas.getContext('2d');
    mCanvas.height = mHeight;
    mCanvas.width = mWidth;

    var mAllObjects = [];

    var updateUIEcho = function () {
        document.getElementById("uiEchoString").innerHTML =
            "<p><b>选中的物体:</b>:</p>" +
            "<ul style=\"margin:-10px\">" +
            "<li>Id: " + gObjectNum + "</li>" +
            "<li>Center: " + mAllObjects[gObjectNum].mCenter.x.toPrecision(3) + "," + mAllObjects[gObjectNum].mCenter.y.toPrecision(3) + "</li>" +
            "<li>Angle: " + mAllObjects[gObjectNum].mAngle.toPrecision(3) + "</li>" +
            "</ul> <hr>" +
            "<p><b>控制选中物体</b>: </p>" +
            "<ul style=\"margin:-10px\">" +
            "<li><b>数字键</b> 或者 <b>上/下 Arrow</b></li>" +
            "<li><b>WASD</b> + <b>QE</b>: 移动+旋转 </li>" +
            "</ul> <hr>" +
            "<b>F/G</b>: 物体生成 [矩形/圆] " +
            "<p><b>H</b>: 固定</p>" +
            "<p><b>R</b>: 重置</p>" +
            "<hr>";
    };
    var draw = function () {
        mContext.clearRect(0, 0, mWidth, mHeight);
        var i;
        for (i = 0; i < mAllObjects.length; i++) {
            mContext.strokeStyle = 'blue';
            if (i === gObjectNum) {
                mContext.strokeStyle = 'red';
            }
            mAllObjects[i].draw(mContext);
        }
    };
    var update = function () {
        var i;
        for (i = 0; i < mAllObjects.length; i++) {
            mAllObjects[i].update(mContext);
        }
    };
    var runGameLoop = function () {
        requestAnimationFrame(function () {
            runGameLoop();
        });


        updateUIEcho();
        draw();

        gEngine.Physics.collision();
        update();

    };
    var initializeEngineCore = function () {
        runGameLoop();
    };
    var mPublic = {
        initializeEngineCore: initializeEngineCore,
        mAllObjects: mAllObjects,
        mWidth: mWidth,
        mHeight: mHeight,
        mContext: mContext
    };
    return mPublic;
}());