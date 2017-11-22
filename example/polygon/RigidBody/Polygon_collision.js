"use strict";

Polygon.prototype.collisionTest = function (otherShape, collisionInfo) {
    var status = false;
    if (otherShape.mType === "Circle") {
        status = this.collidedRectCirc(otherShape, collisionInfo);
    } else {
        status = this.collidedRectRect(this, otherShape, collisionInfo);
    }
    return status;
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

Polygon.prototype.collidedRectRect = function (A, B, collisionInfo) {

    //在A上寻找分离轴
    var overlapAB = getOverLap(A,B,A.mFaceNormal);
    if(overlapAB.overlap<=0){
        return false;
    }

    //在B上寻找分离轴
    var overlapBA = getOverLap(B,A,B.mFaceNormal);
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
    var supportB=A.findSupportPoint(minOverlap.axis,B);   //在B上找支撑点,A是小盒子
    var supportA=B.findSupportPoint(minOverlap.axis.scale(-1),A);   //在A上找支撑点
    var support;
    var gContext=gEngine.Core.mContext;

    support=supportB;
    if(contains(B.mVertex,supportA)){
        support=supportA;
        gContext.strokeStyle = 'purple';
    }

    collisionInfo.setInfo(minOverlap.overlap, minOverlap.axis, support);
    return true;
};

Polygon.prototype.findSupportPoint = function (axis,rect) {
    var support=null,vertex,distance,nearestDistance=Number.MAX_VALUE;

    var tempVertex= new Vec2(0,0);

    var vertices=rect.mVertex;
    for (var i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        tempVertex.x = vertex.x - this.mCenter.x;
        tempVertex.y = vertex.y - this.mCenter.y;
        distance = tempVertex.dot(axis);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            support = vertices[i];
        }
    }
    return support;
};

var projectToAxis = function(vertices, axis) {
    var projection={};
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
    return projection;
};

var getOverLap = function (bodyA,bodyB,axes) {
    var result = { overlap: Number.MAX_VALUE };
    var projectionA,projectionB;
    var overlap;

    for (var i = 0; i < axes.length; i++) {
        var axis = axes[i];
        if(bodyA.mType=='Circle'){
            bodyA.mVertex=[bodyA.mCenter.subtract(axis.scale(bodyA.mRadius)),bodyA.mCenter.add(axis.scale(bodyA.mRadius))]
        }

        projectionA=projectToAxis(bodyA.mVertex, axis);
        projectionB=projectToAxis(bodyB.mVertex, axis);

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

Polygon.prototype.collidedRectCirc = function (circle, collisionInfo) {
    var circ2Pos=circle.mCenter;
    var minDistance =circ2Pos.distance(this.mVertex[0]);
    var nearestEdge = 0;
    var i;

    for (i = 1; i < this.mVertex.length; i++) {
        //连接各顶点到圆心的向量，投影在各轴向量上
        var distance=circ2Pos.distance(this.mVertex[i]);
        if (distance < minDistance) {           //只要有一处投影长度大于0，说明圆心在矩形外
            minDistance=distance;
            nearestEdge=i;
        }
    }
    var axis=[circle.mCenter.subtract(this.mVertex[nearestEdge]).normalize()];

    var overlapAB=getOverLap(circle,this,axis);         //检测圆心和最近顶点组成的轴上是否有重合
    if(overlapAB.overlap<=0){
        return false;
    }

    //在B上寻找分离轴
    var overlapBA=getOverLap(circle,this,this.mFaceNormal);          //检测圆心和最近顶点组成的轴上是否有重合
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