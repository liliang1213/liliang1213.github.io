
"use strict";

function RigidShape(center) {
    this.mCenter = center;
    //angle
    this.mAngle = 0;
    gEngine.Core.mAllObjects.push(this);
}
