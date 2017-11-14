"use strict";

var Rectangle = function (center, width, height, mass, friction, restitution) {
    RigidShape.call(this, center, mass, friction, restitution);
    this.mType = "Rectangle";
    this.mWidth = width;
    this.mHeight = height;
    this.mBoundRadius = Math.sqrt(width * width + height * height) / 2;
    this.mVertex = [];
    this.mFaceNormal = [];

    //0--TopLeft;1--TopRight;2--BottomRight;3--BottomLeft
    this.mVertex[0] = new Vec2(center.x - width / 2, center.y - height / 2);
    this.mVertex[1] = new Vec2(center.x + width / 2, center.y - height / 2);
    this.mVertex[2] = new Vec2(center.x + width / 2, center.y + height / 2);
    this.mVertex[3] = new Vec2(center.x - width / 2, center.y + height / 2);

    //0--Top;1--Right;2--Bottom;3--Left
    //mFaceNormal is normal of face toward outside of matter
    this.mFaceNormal=this.getAxes();

    this.updateInertia();
};

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Rectangle;
Rectangle.prototype = prototype;


Rectangle.prototype.getAxes=function(){
        var axes = [];
        var vertices=this.mVertex;
        for (var i = 0; i < vertices.length; i++) {
            var j = (i + 1) % vertices.length,
                normal = new Vec2(
                    vertices[j].y - vertices[i].y,
                    vertices[i].x - vertices[j].x
                ).normalize();

            axes[i] = normal;
        }

        return axes;
}

Rectangle.prototype.rotate = function (angle) {
    this.mAngle += angle;
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].rotate(this.mCenter, angle);
    }
    this.mFaceNormal=this.getAxes();
    return this;
};

Rectangle.prototype.move = function (v) {
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].add(v);
    }
    this.mCenter = this.mCenter.add(v);
    return this;
};

Rectangle.prototype.draw = function (context) {
    context.save();
    context.translate(this.mVertex[0].x, this.mVertex[0].y);
    context.rotate(this.mAngle);
    context.strokeRect(0, 0, this.mWidth, this.mHeight);


    context.restore();
};

Rectangle.prototype.updateInertia = function () {
    // Expect this.mInvMass to be already inverted!
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        //inertia=mass*width^2+height^2
        this.mInertia = (1 / this.mInvMass) * (this.mWidth * this.mWidth + this.mHeight * this.mHeight) / 12;
        this.mInertia = 1 / this.mInertia;
    }
};