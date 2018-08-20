import RigidShape from './RigidShape';
import Vec2 from '../Lib/Vec2';
import Engine from '../EngineCore/Core';

const Vertices={};

Vertices.centre = vertices => {
    const area = Vertices.area(vertices, true);
    let centre = new Vec2( 0,  0 );
    let cross;
    let temp;
    let j;

    for (let i = 0; i < vertices.length; i++) {
        j = (i + 1) % vertices.length;
        cross = vertices[i].cross(vertices[j]);
        temp = vertices[i].add(vertices[j]).scale(cross);
        centre = centre.add(temp);
    }

    return centre.scale(1/(6 * area));
};

Vertices.area = (vertices, signed) => {
    let area = 0;
    let j = vertices.length - 1;

    for (let i = 0; i < vertices.length; i++) {
        area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
        j = i;
    }

    if (signed)
        return area / 2;
    return Math.abs(area) / 2;
};

Vertices.inertia = (vertices, mass) => {
    let numerator = 0;
    let denominator = 0;
    const v = vertices;
    let cross;
    let j;

    for (let n = 0; n < v.length; n++) {
        j = (n + 1) % v.length;
        cross = Math.abs(v[j].cross(v[n]));
        numerator += cross * (v[j].dot( v[j]) + v[j].dot( v[n]) + v[n].dot( v[n]));
        denominator += cross;
    }

    return (mass / 6) * (numerator / denominator);
};

class Polygon extends RigidShape{
    constructor(opts) {
        super(opts);
        this.mType = "Polygon";
        this.mCenter=Vertices.centre(opts.vertices);
        this.mVertex=[];
        for(let i=0;i<opts.vertices.length;i++){
            this.mVertex[i] = opts.pos.add(opts.vertices[i]);
        }
        this.mBoundRadius = this.getRadius(this.mVertex);
        this.mFaceNormal=this.getAxes();
        this.updateInertia();
    }

    getRadius(vertices) {
        let radius = 0;

        for (let i = 0; i < vertices.length; i++) {
            if(vertices[i].distance(this.mCenter)>radius){
                radius=vertices[i].distance(this.mCenter)
            }
        }

        return radius;
    }

    getAxes() {
        const axes = [];
        const vertices=this.mVertex;
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;

            const normal = new Vec2(
                vertices[j].y - vertices[i].y,
                vertices[i].x - vertices[j].x
            ).normalize();

            axes[i] = normal;
        }
        return axes;
    }

    rotate(angle) {
        this.mAngle += angle;
        let i;
        for (i = 0; i < this.mVertex.length; i++) {
            this.mVertex[i] = this.mVertex[i].rotate(this.mCenter, angle);
        }
        this.mFaceNormal=this.getAxes();
        return this;
    }

    move(v) {
        let i;
        for (i = 0; i < this.mVertex.length; i++) {
            this.mVertex[i] = this.mVertex[i].add(v);
        }
        this.mCenter = this.mCenter.add(v);
        this.x=this.mCenter.x;
        this.y=this.mCenter.y;
        return this;
    }

    updateInertia() {
        // Expect this.mInvMass to be already inverted!
        if (this.mInvMass === 0) {
            this.mInertia = 0;
        } else {
            this.mInertia=Vertices.inertia(this.mVertex,this.mMass);
            this.mInertia = 1 / this.mInertia;
        }
    }

    collisionTest(otherShape, collisionInfo) {
        let status = false;
        if (otherShape.mType === "Circle") {
            status = this.collidedRectCirc(otherShape, collisionInfo);
        } else {
            status = this.collidedRectRect(this, otherShape, collisionInfo);
        }
        return status;
    }

    collidedRectRect(A, B, collisionInfo) {
        //在A上寻找分离轴
        const overlapAB = getOverLap(A,B,A.mFaceNormal);
        if(overlapAB.overlap<=0){
            return false;
        }

        //在B上寻找分离轴
        const overlapBA = getOverLap(B,A,B.mFaceNormal);
        if(overlapBA.overlap<=0){
            return false;
        }

        let minOverlap;
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
        const supportB=A.findSupportPoint(minOverlap.axis,B);   //在B上找支撑点,A是小盒子
        const supportA=B.findSupportPoint(minOverlap.axis.scale(-1),A);   //在A上找支撑点
        let support;
        const gContext=Engine.mContext;

        support=supportB;
        if(contains(B.mVertex,supportA)){
            support=supportA;
        }

        /* gContext.strokeStyle = 'purple';
         gContext.beginPath();
         gContext.moveTo(0,0);
         gContext.lineTo(support.x, support.y);

         gContext.closePath();
         gContext.stroke();*/

        collisionInfo.setInfo(minOverlap.overlap, minOverlap.axis, support);
        return true;
    }

    findSupportPoint(axis, rect) {
        let support=null;
        let vertex;
        let distance;
        let nearestDistance=Number.MAX_VALUE;

        const tempVertex= new Vec2(0,0);

        const vertices=rect.mVertex;
        for (let i = 0; i < vertices.length; i++) {
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
    }

    collidedRectCirc(circle, collisionInfo) {
        const circ2Pos=circle.mCenter;
        let minDistance =circ2Pos.distance(this.mVertex[0]);
        let nearestEdge = 0;
        let i;

        for (i = 1; i < this.mVertex.length; i++) {
            //连接各顶点到圆心的向量，投影在各轴向量上
            const distance=circ2Pos.distance(this.mVertex[i]);
            if (distance < minDistance) {           //只要有一处投影长度大于0，说明圆心在矩形外
                minDistance=distance;
                nearestEdge=i;
            }
        }
        const axis=[circle.mCenter.subtract(this.mVertex[nearestEdge]).normalize()];

        const overlapAB=getOverLap(circle,this,axis);         //检测圆心和最近顶点组成的轴上是否有重合
        if(overlapAB.overlap<=0){
            return false;
        }

        //在B上寻找分离轴
        const overlapBA=getOverLap(circle,this,this.mFaceNormal);          //检测圆心和最近顶点组成的轴上是否有重合
        if(overlapBA.overlap<=0){
            return false;
        }

        let minOverlap;
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
    }
}

var contains = (vertices, point) => {
    for (let i = 0; i < vertices.length; i++) {
        const vertice = vertices[i];
        const nextVertice = vertices[(i + 1) % vertices.length];
        if ((point.x - vertice.x) * (nextVertice.y - vertice.y) + (point.y - vertice.y) * (vertice.x - nextVertice.x) > 0) {
            return false;
        }
    }

    return true;
};

const projectToAxis = (vertices, axis) => {
    const projection={};
    let min = vertices[0].dot(axis);
    let max = min;

    for (let i = 1; i < vertices.length; i += 1) {
        const dot = vertices[i].dot(axis);

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

var getOverLap = (bodyA, bodyB, axes) => {
    const result = { overlap: Number.MAX_VALUE };
    let projectionA;
    let projectionB;
    let overlap;

    for (const axis of axes) {
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

export default Polygon;