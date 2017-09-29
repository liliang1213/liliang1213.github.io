"use strict";

function RigidShape(center) {
    this.mCenter = center;
    //angle
    this.mAngle = 0;
    gEngine.Core.mAllObjects.push(this);
}

//添加重力
RigidShape.prototype.update = function () {
    if (this.mCenter.y < gEngine.Core.mHeight && this.mFix !== 0) {
        this.move(new Vec2(0, 1));
    }
};
