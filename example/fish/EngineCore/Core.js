import Vec2 from '../Lib/Vec2';
import CollisionInfo from '../Lib/CollisionInfo';
import Drawing from '../Drawing';

class Engine {
    constructor(opts) {
        this.width=opts.width;
        this.height=opts.height;
        this.drawing=new opts.drawing({
            width:this.width,
            height:this.height
        });
        this.gravity = new Vec2(0, 10);
        this.collisionResolve=true;

        this.mPositionalCorrectionFlag = true;
        this.mRelaxationCount = 15;                  // number of relaxation iteration
        this.mPosCorrectionRate = 0.8;               // percentage of separation to project objects

        this.mCurrentTime=0;
        this.mElapsedTime=0;
        this.mPreviousTime = Date.now();
        this.mLagTime = 0;
        this.kFPS = 60;          // Frames per second
        this.kFrameTime = 1 / this.kFPS;
        this.mUpdateIntervalInSeconds = this.kFrameTime;
        this.kMPF = 1000 * this.kFrameTime; // Milliseconds per frame.

        this.mAllObjects = [];
        this.mMovement = true;
        this.collisionList=[];
    }

    addObject(obj) {
        this.mAllObjects.push(obj);
    }

    getAllObject(){
        return this.mAllObjects;
    }

    draw(){
        this.drawing.draw(this.mAllObjects);
    };

    init(opts){
        Object.assign(this,opts);
        this.runGameLoop();
    }

    update(){
        let mAllObjects = this.getAllObject();
        let i=mAllObjects.length;
        while(i--){
            mAllObjects[i].update();
        }
    }

    remove(obj){
        const index = this.mAllObjects.indexOf(obj);

        if (index > -1) {
            this.mAllObjects.splice(index, 1);
        }
    }

    runGameLoop(){
        requestAnimationFrame(() => {
            this.runGameLoop();
        });

        this.mCurrentTime = Date.now();
        this.mElapsedTime = this.mCurrentTime - this.mPreviousTime;
        this.mPreviousTime = this.mCurrentTime;
        this.mLagTime += this.mElapsedTime;

        while (this.mLagTime >= this.kMPF) {
            this.mLagTime -= this.kMPF;
            this.collision();
            this.update();
        }
        this.draw();
    }

    addCollisionList(obj){
        this.collisionList.push(obj);
    }

    removeCollisionList(obj){
        const index = this.collisionList.indexOf(obj);

        if (index > -1) {
            this.collisionList.splice(index, 1);
        }
    }

    collision(){
        const collisionInfo = new CollisionInfo();
        let collisionList=this.collisionList;
        let mAllObjects=this.getAllObject();
        let collisionObject=[];
        let l=mAllObjects.length;
        while(l--){
            mAllObjects[l].collided=false;
            if(mAllObjects[l].collisionGroup==1){
                if(collisionList.indexOf(mAllObjects[l])<0){
                    collisionObject.push(mAllObjects[l])
                }
            }
        }

        let i=collisionList.length;
        try {
            while (i--) {
                let j=collisionObject.length;
                while (j--) {
                    if (collisionList[i] != collisionObject[j] && collisionList[i]) {
                        if (collisionList[i].boundTest(collisionObject[j])) {
                            if (collisionList[i].collisionTest(collisionObject[j], collisionInfo)) {
                                collisionList[i].collided = true;
                                collisionObject[j].collided = true;
                                collisionList[i].emit('collision', collisionObject[j]);
                                if (this.collisionResolve) {
                                    if (collisionInfo.getNormal().dot(collisionObject[j].mCenter.subtract(collisionList[i].mCenter)) < 0) {
                                        collisionInfo.changeDir();
                                    }
                                    this.resolveCollision(collisionList[i], collisionObject[j], collisionInfo);
                                }
                            }
                        }
                    }
                }
            }
        }catch(e){
            debugger;
        }
    };


    positionalCorrection(s1, s2, collisionInfo){
        const s1InvMass = s1.mInvMass;
        const s2InvMass = s2.mInvMass;

        const num = collisionInfo.getDepth() / (s1InvMass + s2InvMass) * this.mPosCorrectionRate;
        const correctionAmount = collisionInfo.getNormal().scale(num);

        s1.move(correctionAmount.scale(-s1InvMass));
        s2.move(correctionAmount.scale(s2InvMass));
    }

    resolveCollision (s1, s2, collisionInfo) {

        if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
            return;
        }

        //  correct positions
        if (this.mPositionalCorrectionFlag) {
            this.positionalCorrection(s1, s2, collisionInfo);
        }

        const n = collisionInfo.getNormal();

        //the direction of collisionInfo is always from s1 to s2
        //but the Mass is inversed, so start scale with s2 and end scale with s1
        const start = collisionInfo.mStart.scale(s2.mInvMass / (s1.mInvMass + s2.mInvMass));
        const end = collisionInfo.mEnd.scale(s1.mInvMass / (s1.mInvMass + s2.mInvMass));
        const p = start.add(end);
        //r is vector from center of object to collision point
        const r1 = p.subtract(s1.mCenter);
        const r2 = p.subtract(s2.mCenter);

        //newV = V + mAngularVelocity cross R
        const v1 = s1.mVelocity.add(new Vec2(-1 * s1.mAngularVelocity * r1.y, s1.mAngularVelocity * r1.x));
        const v2 = s2.mVelocity.add(new Vec2(-1 * s2.mAngularVelocity * r2.y, s2.mAngularVelocity * r2.x));
        const relativeVelocity = v2.subtract(v1);

        // Relative velocity in normal direction
        const rVelocityInNormal = relativeVelocity.dot(n);

        //if objects moving apart ignore
        if (rVelocityInNormal > 0) {
            return;
        }

        // compute and apply response impulses for each object
        const newRestituion = Math.min(s1.mRestitution, s2.mRestitution);
        const newFriction = Math.min(s1.mFriction, s2.mFriction);

        //R cross N
        const R1crossN = r1.cross(n);
        const R2crossN = r2.cross(n);

        // Calc impulse scalar
        // the formula of jN can be found in http://www.myphysicslab.com/collision.html
        let jN = -(1 + newRestituion) * rVelocityInNormal;
        jN = jN / (s1.mInvMass + s2.mInvMass +
            R1crossN * R1crossN * s1.mInertia +
            R2crossN * R2crossN * s2.mInertia);

        //impulse is in direction of normal ( from s1 to s2)
        let impulse = n.scale(jN);
        // impulse = F dt = m * ?v
        // ?v = impulse / m
        s1.mVelocity = s1.mVelocity.subtract(impulse.scale(s1.mInvMass));
        s2.mVelocity = s2.mVelocity.add(impulse.scale(s2.mInvMass));

        s1.mAngularVelocity -= R1crossN * jN * s1.mInertia;
        s2.mAngularVelocity += R2crossN * jN * s2.mInertia;

        let tangent = relativeVelocity.subtract(n.scale(relativeVelocity.dot(n)));

        //relativeVelocity.dot(tangent) should less than 0
        tangent = tangent.normalize().scale(-1);

        const R1crossT = r1.cross(tangent);
        const R2crossT = r2.cross(tangent);

        let jT = -(1 + newRestituion) * relativeVelocity.dot(tangent) * newFriction;
        jT = jT / (s1.mInvMass + s2.mInvMass + R1crossT * R1crossT * s1.mInertia + R2crossT * R2crossT * s2.mInertia);

        //friction should less than force in normal direction
        if (jT > jN) {
            jT = jN;
        }

        //impulse is from s1 to s2 (in opposite direction of velocity)
        impulse = tangent.scale(jT);

        s1.mVelocity = s1.mVelocity.subtract(impulse.scale(s1.mInvMass));
        s2.mVelocity = s2.mVelocity.add(impulse.scale(s2.mInvMass));
        s1.mAngularVelocity -= R1crossT * jT * s1.mInertia;
        s2.mAngularVelocity += R2crossT * jT * s2.mInertia;
    }
}

export default new Engine({
    width:800,
    height:450,
    drawing:Drawing
});