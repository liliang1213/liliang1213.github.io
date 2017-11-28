
"use strict";

/**
 * Static refrence to gEngine
 * @type gEngine
 */
var gEngine = gEngine || {};

gEngine.Core = (function () {
    var mCanvas, mContext, mWidth = 800, mHeight = 450;
    mCanvas = document.getElementById('canvas');
    mContext = mCanvas.getContext('2d');
    mCanvas.height = mHeight;
    mCanvas.width = mWidth;

    var mGravity = new Vec2(0, 200);
    var mMovement = true;

    var mCurrentTime, mElapsedTime, mPreviousTime = Date.now(), mLagTime = 0;
    var kFPS = 60;
    var kFrameTime = 1 / kFPS;
    var mUpdateIntervalInSeconds = kFrameTime;
    var kMPF = 1000 * kFrameTime;
    var mAllObjects = [];

    var updateUIEcho = function () {
        document.getElementById("uiEchoString").innerHTML ="";

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

        mCurrentTime = Date.now();
        mElapsedTime = mCurrentTime - mPreviousTime;
        mPreviousTime = mCurrentTime;
        mLagTime += mElapsedTime;

        updateUIEcho();
        draw();

        while (mLagTime >= kMPF) {
            mLagTime -= kMPF;
            gEngine.Physics.collision();
            update();
        }
    };
    var initializeEngineCore = function () {
        runGameLoop();
    };
    var mPublic = {
        initializeEngineCore: initializeEngineCore,
        mAllObjects: mAllObjects,
        mWidth: mWidth,
        mHeight: mHeight,
        mContext: mContext,
        mGravity: mGravity,
        mUpdateIntervalInSeconds: mUpdateIntervalInSeconds,
        mMovement: mMovement
    };
    return mPublic;
}());