/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*jslint node: true, vars: true, evil: true, bitwise: true */
/*global  requestAnimationFrame: false */
/*global document,gObjectNum */
"use strict";  // Operate in Strict mode such that variables must be declared before used!

/**
 * Static refrence to gEngine
 * @type gEngine
 */
var gEngine = gEngine || {};
// initialize the variable while ensuring it is not redefined
gEngine.Core = (function () {
    var mCanvas, mContext, mWidth = 800, mHeight = 450;
    mCanvas = document.getElementById('canvas');
    mContext = mCanvas.getContext('2d');
    mCanvas.height = mHeight;
    mCanvas.width = mWidth;

    var mGravity = new Vec2(0, 200);
    var mMovement = true;

    var mCurrentTime, mElapsedTime, mPreviousTime = Date.now(), mLagTime = 0;
    var kFPS = 60;          // Frames per second
    var kFrameTime = 1 / kFPS;
    var mUpdateIntervalInSeconds = kFrameTime;
    var kMPF = 1000 * kFrameTime; // Milliseconds per frame.
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

        //      compute how much time has elapsed since we last runGameLoop was executed
        mCurrentTime = Date.now();
        mElapsedTime = mCurrentTime - mPreviousTime;
        mPreviousTime = mCurrentTime;
        mLagTime += mElapsedTime;

        updateUIEcho();
        draw();
        //      Make sure we update the game the appropriate number of times.
        //      Update only every Milliseconds per frame.
        //      If lag larger then update frames, update until caught up.
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