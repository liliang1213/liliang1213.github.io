"use strict";

var Circle = function (center, radius) {
    RigidShape.call(this, center);
    this.mType = "Circle";

    this.mRadius = radius;

    //起点到圆心的连线
    this.mStartpoint = new Vec2(center.x, center.y - radius);
};

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Circle;
Circle.prototype = prototype;

Circle.prototype.draw = function (context) {

    context.beginPath();

    //draw a circle
    context.arc(this.mCenter.x, this.mCenter.y, this.mRadius, 0, Math.PI * 2, true);

    //draw a line from start point toward center
    context.moveTo(this.mStartpoint.x, this.mStartpoint.y);
    context.lineTo(this.mCenter.x, this.mCenter.y);
    context.closePath();
    context.stroke();
};
