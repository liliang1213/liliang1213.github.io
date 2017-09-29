"use strict";

var Circle = function (center, radius, fix) {
    RigidShape.call(this, center);
    this.mType = "Circle";

    this.mRadius = radius;
    this.mFix = fix;
    //起点到圆心的连线
    this.mStartpoint = new Vec2(center.x, center.y - radius);

};

Circle.prototype = Object.create(RigidShape.prototype);

Circle.prototype.move = function (s) {
    this.mStartpoint = this.mStartpoint.add(s);
    this.mCenter = this.mCenter.add(s);
    return this;
};

Circle.prototype.draw = function (context) {

    context.beginPath();

    //画圆
    context.arc(this.mCenter.x, this.mCenter.y, this.mRadius, 0, Math.PI * 2, true);

    //画起点到圆心的连线
    context.moveTo(this.mStartpoint.x, this.mStartpoint.y);
    context.lineTo(this.mCenter.x, this.mCenter.y);

    context.closePath();
    context.stroke();
};

//旋转
Circle.prototype.rotate = function (angle) {
    this.mAngle += angle;
    this.mStartpoint = this.mStartpoint.rotate(this.mCenter, angle);
    return this;
};
