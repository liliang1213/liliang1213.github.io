/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global RigidShape */

var Polygon = function (center, sides, radius,mass, friction, restitution) {

    RigidShape.call(this, center, mass, friction, restitution);
    this.mType = "Polygon";
    // this.mBoundRadius = Math.sqrt(width * width + height * height) / 2;
    var theta = 2 * Math.PI / sides,
        offset = theta * 0.5;
    this.mVertex = [];
    for (var i = 0; i < sides; i += 1) {
        var angle = offset + (i * theta),
            xx = Math.cos(angle) * radius,
            yy = Math.sin(angle) * radius;
        this.mVertex.push(new Vec2(xx,yy));
    }
    this.mFaceNormal = this.getFaceNormal();

    this.updateInertia();
};

var prototype = Object.create(Polygon.prototype);
prototype.constructor = Polygon;
Polygon.prototype = prototype;

Polygon.prototype.rotate = function (angle) {
    this.mAngle += angle;
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].rotate(this.mCenter, angle);
    }
    this.mFaceNormal[0] = this.mVertex[1].subtract(this.mVertex[2]);
    this.mFaceNormal[0] = this.mFaceNormal[0].normalize();
    this.mFaceNormal[1] = this.mVertex[2].subtract(this.mVertex[3]);
    this.mFaceNormal[1] = this.mFaceNormal[1].normalize();
    this.mFaceNormal[2] = this.mVertex[3].subtract(this.mVertex[0]);
    this.mFaceNormal[2] = this.mFaceNormal[2].normalize();
    this.mFaceNormal[3] = this.mVertex[0].subtract(this.mVertex[1]);
    this.mFaceNormal[3] = this.mFaceNormal[3].normalize();
    return this;
};

Polygon.prototype.getFaceNormal = function () {
    var axes = [];

    for (var i = 0; i < this.mVertex.length; i++) {
        var j = (i + 1) % this.mVertex.length,
            normal = new Vec2(this.mVertex[j].y - this.mVertex[i].y, this.mVertex[i].x - this.mVertex[j].x).normalize()
        axes[i]=normal;
    }

    return axes;
};

Polygon.prototype.move = function (v) {
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].add(v);
    }
    this.mCenter = this.mCenter.add(v);
    return this;
};

Polygon.prototype.draw = function (context) {
    context.save();

    context.translate(this.mVertex[0].x, this.mVertex[0].y);
    context.rotate(this.mAngle);
    context.strokeRect(0, 0, this.mWidth, this.mHeight);

    context.restore();
};

Polygon.prototype.updateInertia = function () {
    // Expect this.mInvMass to be already inverted!
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        //inertia=mass*width^2+height^2
        this.mInertia = (1 / this.mInvMass) * (this.mWidth * this.mWidth + this.mHeight * this.mHeight) / 12;
        this.mInertia = 1 / this.mInertia;
    }
};