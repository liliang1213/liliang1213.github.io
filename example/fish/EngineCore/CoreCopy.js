import Vec2 from '../Lib/Vec2';
import CollisionInfo from '../Lib/CollisionInfo';

var gEngine = window.gEngine || {};
// initialize the variable while ensuring it is not redefined
gEngine.Core = ((() => {
    let mCanvas;
    let mContext;
    const mWidth = 800;
    const mHeight = 450;
    mCanvas = document.getElementById('canvas');
    mContext = mCanvas.getContext('2d');
    mCanvas.height = mHeight;
    mCanvas.width = mWidth;

    const mGravity = new Vec2(0, 200);
    const mMovement = true;

    let mCurrentTime;
    let mElapsedTime;
    let mPreviousTime = Date.now();
    let mLagTime = 0;
    const kFPS = 60;          // Frames per second
    const kFrameTime = 1 / kFPS;
    const mUpdateIntervalInSeconds = kFrameTime;
    const kMPF = 1000 * kFrameTime; // Milliseconds per frame.
    var mAllObjects = [];


    const draw = () => {
        mContext.clearRect(0, 0, mWidth, mHeight);
        let i;
        for (i = 0; i < mAllObjects.length; i++) {
            mContext.strokeStyle = 'blue';
            if (i === 3) {
                mContext.strokeStyle = 'red';
            }
            mAllObjects[i].draw(mContext);
        }
    };
    const update = () => {
        let i;
        for (i = 0; i < mAllObjects.length; i++) {
            mAllObjects[i].update(mContext);
        }
    };
    const runGameLoop = () => {
        requestAnimationFrame(() => {
            runGameLoop();
        });

        //      compute how much time has elapsed since we last runGameLoop was executed
        mCurrentTime = Date.now();
        mElapsedTime = mCurrentTime - mPreviousTime;
        mPreviousTime = mCurrentTime;
        mLagTime += mElapsedTime;

        draw();

        while (mLagTime >= kMPF) {
            mLagTime -= kMPF;
            gEngine.Physics.collision();
            update();
        }
    };
    const initializeEngineCore = () => {
        runGameLoop();
    };

    const getAllObject=()=>{
        return mAllObjects;
    };

    const addObject=(obj)=>{
        mAllObjects.push(obj);
    };

    var mPublic = {
        initializeEngineCore: initializeEngineCore,
        getAllObject: getAllObject,
        mAllObjects:mAllObjects,
        addObject:addObject,
        mWidth: mWidth,
        mHeight: mHeight,
        mContext: mContext,
        mGravity: mGravity,
        mUpdateIntervalInSeconds: mUpdateIntervalInSeconds,
        mMovement: mMovement
    };
    return mPublic;
})());


gEngine.Physics = ((() => {

    const mPositionalCorrectionFlag = true;
    const mRelaxationCount = 15;                  // number of relaxation iteration
    const mPosCorrectionRate = 0.8;               // percentage of separation to project objects

    const positionalCorrection = (s1, s2, collisionInfo) => {
        const s1InvMass = s1.mInvMass;
        const s2InvMass = s2.mInvMass;

        const num = collisionInfo.getDepth() / (s1InvMass + s2InvMass) * mPosCorrectionRate;
        const correctionAmount = collisionInfo.getNormal().scale(num);

        s1.move(correctionAmount.scale(-s1InvMass));
        s2.move(correctionAmount.scale(s2InvMass));
    };

    const resolveCollision = (s1, s2, collisionInfo) => {

        if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
            return;
        }

        //  correct positions
        if (gEngine.Physics.mPositionalCorrectionFlag) {
            positionalCorrection(s1, s2, collisionInfo);
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
    };

    const collision = () => {
        let i;
        let j;
        let k;
        const collisionInfo = new CollisionInfo();
        var mAllObjects=gEngine.Core.getAllObject();
        for (k = 0; k < mRelaxationCount; k++) {
            for (i = 0; i < mAllObjects.length; i++) {
                for (j = i + 1; j < mAllObjects.length; j++) {
                    if (mAllObjects[i].boundTest(mAllObjects[j])) {
                        if (mAllObjects[i].collisionTest(mAllObjects[j], collisionInfo)) {
                            //make sure the normal is always from object[i] to object[j]
                            if (collisionInfo.getNormal().dot(mAllObjects[j].mCenter.subtract(mAllObjects[i].mCenter)) < 0) {
                                collisionInfo.changeDir();
                            }

                            //draw collision info (a black line that shows normal)
                            //drawCollisionInfo(collisionInfo, gEngine.Core.mContext);

                            resolveCollision(mAllObjects[i], mAllObjects[j], collisionInfo);
                        }
                    }
                }
            }
        }
    };
    const mPublic = {
        collision: collision,
        mPositionalCorrectionFlag: mPositionalCorrectionFlag
    };

    return mPublic;
})());

export default gEngine;