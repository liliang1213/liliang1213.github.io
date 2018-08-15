import Vec2 from '../Lib/Vec2';
import gEngine from '../EngineCore/Core';

class RigidShape {
    constructor(center, mass, friction, restitution) {

        this.mCenter = center;
        this.mInertia = 0;
        this.mMass=mass;
        if (mass !== undefined) {
            this.mInvMass = mass;
        } else {
            this.mInvMass = 1;
        }

        if (friction !== undefined) {
            this.mFriction = friction;
        } else {
            this.mFriction = 0.8;
        }

        if (restitution !== undefined) {
            this.mRestitution = restitution;
        } else {
            this.mRestitution = 0.2;
        }

        this.mVelocity = new Vec2(0, 0);

        if (this.mInvMass !== 0) {
            this.mInvMass = 1 / this.mInvMass;
            this.mAcceleration = gEngine.Core.mGravity;
        } else {
            this.mAcceleration = new Vec2(0, 0);
        }

        //angle
        this.mAngle = 0;

        this.mAngularVelocity = 0;

        this.mAngularAcceleration = 0;

        this.mBoundRadius = 0;
        console.log(gEngine.Core.mAllObjects,'gEngine.Core.mAllObjects');
        console.log(gEngine.Core,'gEngine.Core')
        gEngine.Core.addObject(this);
    }

    updateMass(delta) {
        let mass;
        if (this.mInvMass !== 0) {
            mass = 1 / this.mInvMass;
        } else {
            mass = 0;
        }

        mass += delta;
        if (mass <= 0) {
            this.mInvMass = 0;
            this.mVelocity = new Vec2(0, 0);
            this.mAcceleration = new Vec2(0, 0);
            this.mAngularVelocity = 0;
            this.mAngularAcceleration = 0;
        } else {
            this.mInvMass = 1 / mass;
            this.mAcceleration = gEngine.Core.mGravity;
        }
        this.updateInertia();
    }

    updateInertia() {
        // subclass must define this.
        // must work with inverted this.mInvMass
    }

    update() {
        if (gEngine.Core.mMovement) {
            const dt = gEngine.Core.mUpdateIntervalInSeconds;
            //v += a*t
            this.mVelocity = this.mVelocity.add(this.mAcceleration.scale(dt));
            //s += v*t
            this.move(this.mVelocity.scale(dt));

            this.mAngularVelocity += this.mAngularAcceleration * dt;
            this.rotate(this.mAngularVelocity * dt);
        }
        const width = gEngine.Core.mWidth;
        const height = gEngine.Core.mHeight;
        if (this.mCenter.x < 0 || this.mCenter.x > width || this.mCenter.y < 0 || this.mCenter.y > height) {
            const index = gEngine.Core.mAllObjects.indexOf(this);
            if (index > -1)
                gEngine.Core.mAllObjects.splice(index, 1);
        }

    }

    boundTest(otherShape) {
        const vFrom1to2 = otherShape.mCenter.subtract(this.mCenter);
        const rSum = this.mBoundRadius + otherShape.mBoundRadius;
        const dist = vFrom1to2.length();
        if (dist > rSum) {
            //not overlapping
            return false;
        }
        return true;
    }
}

export default RigidShape;