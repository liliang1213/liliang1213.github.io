/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global RigidShape */
var Vertices={};

Vertices.centre = function(vertices) {
    var area = Vertices.area(vertices, true),
        centre = new Vec2( 0,  0 ),
        cross,
        temp,
        j;

    for (var i = 0; i < vertices.length; i++) {
        j = (i + 1) % vertices.length;
        cross = vertices[i].cross(vertices[j]);
        temp = vertices[i].add(vertices[j]).scale(cross);
        centre = centre.add(temp);
    }

    return centre.scale(1/(6 * area));
};

Vertices.area = function(vertices, signed) {
    var area = 0,
        j = vertices.length - 1;

    for (var i = 0; i < vertices.length; i++) {
        area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
        j = i;
    }

    if (signed)
        return area / 2;
    return Math.abs(area) / 2;
};

Vertices.inertia = function(vertices, mass) {
    var numerator = 0,
        denominator = 0,
        v = vertices,
        cross,
        j;

    for (var n = 0; n < v.length; n++) {
        j = (n + 1) % v.length;
        cross = Math.abs(v[j].cross(v[n]));
        numerator += cross * (v[j].dot( v[j]) + v[j].dot( v[n]) + v[n].dot( v[n]));
        denominator += cross;
    }

    return (mass / 6) * (numerator / denominator);
};

var Polygon = function (vertices , mass, friction, restitution) {
    var center=Vertices.centre(vertices);
    RigidShape.call(this, center, mass, friction, restitution);
    this.mType = "Polygon";

    this.mVertex = vertices;
    this.mBoundRadius = this.getRadius(this.mVertex);
    this.mFaceNormal=this.getAxes();
    this.updateInertia();
};

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Polygon;
Polygon.prototype = prototype;

Polygon.prototype.getRadius=function(vertices){
    var radius = 0;

    for (var i = 0; i < vertices.length; i++) {
        if(vertices[i].distance(this.mCenter)>radius){
            radius=vertices[i].distance(this.mCenter)
        }
    }

    return radius;
}

Polygon.prototype.getAxes=function(){
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

Polygon.prototype.rotate = function (angle) {
    this.mAngle += angle;
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].rotate(this.mCenter, angle);
    }
    this.mFaceNormal=this.getAxes();
    return this;
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
    context.beginPath();
    var vertices=this.mVertex;
    for (var i = 0; i < vertices.length; i++) {
        var j = (i + 1) % vertices.length;
        context.moveTo(this.mVertex[i].x, this.mVertex[i].y);
        context.lineTo(this.mVertex[j].x, this.mVertex[j].y);
    }
    context.closePath();
    context.stroke();

    context.translate(this.mVertex[0].x, this.mVertex[0].y);
    context.rotate(this.mAngle);

    context.restore();
};

Polygon.prototype.updateInertia = function () {
    // Expect this.mInvMass to be already inverted!
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        this.mInertia=Vertices.inertia(this.mVertex,this.mMass);
        this.mInertia = 1 / this.mInertia;
    }
};