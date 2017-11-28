"use strict";
var gEngine = gEngine || {};

gEngine.Physics = (function () {
    var mPositionalCorrectionFlag = true;
    var mRelaxationCount = 10;                  // number of relaxation iteration
    var mPosCorrectionRate = 0.8;               // percentage of separation to project objects

    var positionalCorrection = function (s1, s2, collisionInfo) {
        var s1InvMass = s1.mInvMass;
        var s2InvMass = s2.mInvMass;

        if(collisionInfo.getDepth()<0.001){
            return;
        }
        var num = collisionInfo.getDepth() / (s1InvMass + s2InvMass) * mPosCorrectionRate;
        var correctionAmount = collisionInfo.getNormal().scale(num);

        s1.move(correctionAmount.scale(-s1InvMass));
        s2.move(correctionAmount.scale(s2InvMass));
    };

    var resolveCollision = function (s1, s2, collisionInfo) {

        if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
            return;
        }

        if (gEngine.Physics.mPositionalCorrectionFlag) {
            positionalCorrection(s1, s2, collisionInfo);
        }

        var n = collisionInfo.getNormal();

        var v1 = s1.mVelocity;
        var v2 = s2.mVelocity;
        var relativeVelocity = v2.subtract(v1);

        // Relative velocity in normal direction
        var rVelocityInNormal = relativeVelocity.dot(n);

        // if objects moving apart ignore
        if (rVelocityInNormal > 0) {
            return;
        }

        var newRestituion = Math.min(s1.mRestitution, s2.mRestitution);
        var newFriction = Math.min(s1.mFriction, s2.mFriction);

        // 计算法向冲量
        var jN = -(1 + newRestituion) * rVelocityInNormal;
        jN = jN / (s1.mInvMass + s2.mInvMass);

        var impulse = n.scale(jN);
        // △v = j / m
        s1.mVelocity = s1.mVelocity.subtract(impulse.scale(s1.mInvMass));
        s2.mVelocity = s2.mVelocity.add(impulse.scale(s2.mInvMass));

        var tangent = new Vec2(-n.y, n.x);

        // 计算切向冲量
        var jT = -(1 + newRestituion) * relativeVelocity.dot(tangent) * newFriction;
        jT = jT / (s1.mInvMass + s2.mInvMass);

        if (jT > jN) {
            jT = jN;
        }

        impulse = tangent.scale(jT);

        s1.mVelocity = s1.mVelocity.subtract(impulse.scale(s1.mInvMass));
        s2.mVelocity = s2.mVelocity.add(impulse.scale(s2.mInvMass));
    };

    var collision = function () {
        var i, j, k;
        var collisionInfo = new CollisionInfo();
        for (k = 0; k < mRelaxationCount; k++) {
            for (i = 0; i < gEngine.Core.mAllObjects.length; i++) {
                for (j = i + 1; j < gEngine.Core.mAllObjects.length; j++) {

                    if (gEngine.Core.mAllObjects[i].boundTest(gEngine.Core.mAllObjects[j])) {
                        if (gEngine.Core.mAllObjects[i].collisionTest(gEngine.Core.mAllObjects[j], collisionInfo)) {
                            //make sure the normal is always from object[i] to object[j]
                            if (collisionInfo.getNormal().dot(gEngine.Core.mAllObjects[j].mCenter.subtract(gEngine.Core.mAllObjects[i].mCenter)) < 0) {
                                collisionInfo.changeDir();
                            }

                            // gEngine.Core.mContext.strokeStyle = 'red';
                            gEngine.Core.mAllObjects[i].setCollision(true);
                            gEngine.Core.mAllObjects[j].setCollision(true);

                            //draw collision info (a black line that shows normal)
                            //drawCollisionInfo(collisionInfo, gEngine.Core.mContext);

                            resolveCollision(gEngine.Core.mAllObjects[i], gEngine.Core.mAllObjects[j], collisionInfo);
                        }else{
                            gEngine.Core.mAllObjects[i].setCollision(false);
                            gEngine.Core.mAllObjects[j].setCollision(false);
                        }
                    }
                }
            }
        }
    };
    var mPublic = {
        collision: collision,
        mPositionalCorrectionFlag: mPositionalCorrectionFlag
    };

    return mPublic;
}());

