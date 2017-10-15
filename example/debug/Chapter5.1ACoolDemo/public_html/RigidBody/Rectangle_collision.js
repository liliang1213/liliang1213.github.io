/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/*global Rectangle, Vec2 */

Rectangle.prototype.collisionTest = function (otherShape, collisionInfo) {
    var status = false;
    if (otherShape.mType === "Circle") {
        status = this.collidedRectCirc(otherShape, collisionInfo);
    } else {
        status = this.collidedRectRect(this, otherShape, collisionInfo);
    }
    return status;
};

var SupportStruct = function () {
    this.mSupportPoint = null;
    this.mSupportPointDist = 0;
};
var tmpSupport = new SupportStruct();

/**
 * Find the shortest axis that overlapping
 * @memberOf Rectangle
 * @param {Rectangle} otherRect  another matter that being tested
 * @param {CollisionInfo} collisionInfo  record the collision information
 * @returns {Boolean} true if has overlap part in all four directions.
 * the code is convert from http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032
 */
Rectangle.prototype.findAxis = function (otherRect) {
    var minOverLap=getOverLap(this,otherRect);
    return minOverLap;
};

var _projectToAxis = function(projection, vertices, axis) {
    var min = vertices[0].dot(axis),
        max = min;

    for (var i = 1; i < vertices.length; i += 1) {
        var dot = vertices[i].dot(axis);

        if (dot > max) {
            max = dot;
        } else if (dot < min){
            min = dot;
        }
    }

    projection.min = min;
    projection.max = max;
};

var getOverLap = function (rect,otherRect) {
    var axes= rect.mFaceNormal,axis;
    var result = { overlap: Number.MAX_VALUE };
    var projectionA=new Vec2(0,0);
    var projectionB=new Vec2(0,0);
    var overlap;

    for (var i = 0; i < axes.length; i++) {
        axis = axes[i];

        _projectToAxis(projectionA, rect.mVertex, axis);
        _projectToAxis(projectionB, otherRect.mVertex, axis);

        overlap = Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);

        if (overlap <= 0) {
            result.overlap = overlap;
            return result;
        }

        if (overlap < result.overlap) {
            result.overlap = overlap;
            result.axis = axis;
        }
    }
    return result;
};

var contains = function(vertices, point) {
    for (var i = 0; i < vertices.length; i++) {
        var vertice = vertices[i],
            nextVertice = vertices[(i + 1) % vertices.length];
        if ((point.x - vertice.x) * (nextVertice.y - vertice.y) + (point.y - vertice.y) * (vertice.x - nextVertice.x) > 0) {
            return false;
        }
    }

    return true;
};
/**
 * Check for collision between RigidRectangle and RigidRectangle
 * @param {Rectangle} r1 Rectangle object to check for collision status
 * @param {Rectangle} r2 Rectangle object to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf Rectangle
 */
Rectangle.prototype.collidedRectRect = function (A, B, collisionInfo) {

    //在A上寻找分离轴
    var overlapAB = A.findAxis(B);
    if(overlapAB.overlap<=0){
        return false;
    }

    //在B上寻找分离轴
    var overlapBA = B.findAxis(A);
    if(overlapBA.overlap<=0){
        return false;
    }

    var minOverlap;
    if(overlapAB.overlap<overlapBA.overlap){
        minOverlap=overlapAB;
    }else{
        minOverlap=overlapBA;
    }

    //纠正轴向量的方向
    if (minOverlap.axis.dot( B.mCenter.subtract( A.mCenter)) < 0) {
        minOverlap.axis=minOverlap.axis.scale(-1);
    }

    //寻找支撑点
    var supportB=A.findSupportPoint(minOverlap,B);   //在A上找支撑点
    var supportA=B.findSupportPoint(minOverlap,A);   //在B上找支撑点
    var support;
    if(supportB&&contains(A.mVertex,supportB)){
        support=supportB;
        collisionInfo.setInfo(minOverlap.overlap, minOverlap.axis, support);
    }else{
        support=supportA;
        collisionInfo.setInfo(minOverlap.overlap, minOverlap.axis.scale(-1), support.subtract(minOverlap.axis.scale(minOverlap.overlap)));
    }

    var gContext=gEngine.Core.mContext;
     gContext.strokeStyle = 'green';
     gContext.beginPath();
     gContext.moveTo(0,0);
     gContext.lineTo(support.x, support.y);

     gContext.closePath();
     gContext.stroke();


    return true;
};

Rectangle.prototype.findSupportPoint = function (overlap,rect) {
    var support=null,vertex,distance,nearestDistance=Number.MAX_VALUE;

   var tempVertex= new Vec2(0,0);

    var vertices=rect.mVertex;
    for (var i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        tempVertex.x = vertex.x - this.mCenter.x;
        tempVertex.y = vertex.y - this.mCenter.y;
        distance = tempVertex.dot(overlap.axis);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            support = vertices[i];
        }
    }
    return support;
};

/**
 * Check for collision between Rectangle and Circle
 * @param {Circle} otherCir circle to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf Rectangle
 */

var getCircleOverLap = function (bodyA,bodyB,axes) {
    var result = { overlap: Number.MAX_VALUE };
    var projectionA=new Vec2(0,0);
    var projectionB=new Vec2(0,0);
    var overlap;

    for (var i = 0; i < axes.length; i++) {
        var axis = axes[i];
        if(bodyA.mType=='Circle'){
            bodyA.mVertex=[bodyA.mCenter.subtract(axis.scale(bodyA.mRadius)),bodyA.mCenter.add(axis.scale(bodyA.mRadius))]
        }
        _projectToAxis(projectionA, bodyA.mVertex, axis);
        _projectToAxis(projectionB, bodyB.mVertex, axis);

        overlap = Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);
        if (overlap <= 0) {
            result.overlap = overlap;
            return result;
        }


        if (overlap < result.overlap) {
            result.overlap = overlap;
            result.axis = axis;
        }
    }
    return result;
};

Rectangle.prototype.collidedRectCirc = function (circle, collisionInfo) {
    var circ2Pos=circle.mCenter;
    var minDistance =circ2Pos.distance(this.mVertex[0]);
    var nearestEdge = 0;
    var i;

    for (i = 1; i < 4; i++) {
        //连接各顶点到圆心的向量，投影在各轴向量上
        var distance=circ2Pos.distance(this.mVertex[i]);
        if (distance < minDistance) {           //只要有一处投影长度大于0，说明圆心在矩形外
            minDistance=distance;
            nearestEdge=i;
        }
    }
    var axis=[circle.mCenter.subtract(this.mVertex[nearestEdge]).normalize()];
 /*   var gContext=gEngine.Core.mContext;
     gContext.strokeStyle = 'green';
     gContext.beginPath();
     gContext.moveTo(circle.mCenter.x, circle.mCenter.y);
     gContext.lineTo(this.mVertex[nearestEdge].x, this.mVertex[nearestEdge].y);

     gContext.closePath();
     gContext.stroke();*/


    var overlapAB=getCircleOverLap(circle,this,axis);         //检测圆心和最近顶点组成的轴上是否有重合
    if(overlapAB.overlap<=0){
        return false;
    }

    //在B上寻找分离轴
    var overlapBA=getCircleOverLap(circle,this,this.mFaceNormal);          //检测圆心和最近顶点组成的轴上是否有重合
    if(overlapBA.overlap<=0){
        return false;
    }

    var minOverlap;
    if(overlapAB.overlap<overlapBA.overlap){
        minOverlap=overlapAB;
    }else{
        minOverlap=overlapBA;
    }

    //如果碰撞轴指向了圆则反转轴的方向
    if (minOverlap.axis.dot( circle.mCenter.subtract( this.mCenter)) > 0) {
        minOverlap.axis=minOverlap.axis.scale(-1);
    }

    collisionInfo.setInfo(minOverlap.overlap, minOverlap.axis, circle.mCenter.add(minOverlap.axis.scale(circle.mRadius-minOverlap.overlap)));
    return true;
};