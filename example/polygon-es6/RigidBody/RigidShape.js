import Vec2 from '../Lib/Vec2';
import Engine from '../EngineCore/Core';

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
            this.mAcceleration = Engine.mGravity;
        } else {
            this.mAcceleration = new Vec2(0, 0);
        }

        //angle
        this.mAngle = 0;

        this.mAngularVelocity = 0;

        this.mAngularAcceleration = 0;

        this.mBoundRadius = 0;
        Engine.addObject(this);
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
            this.mAcceleration = Engine.mGravity;
        }
        this.updateInertia();
    }

    updateInertia() {
        // subclass must define this.
        // must work with inverted this.mInvMass
    }

    update() {
        if (Engine.mMovement) {
            const dt = Engine.mUpdateIntervalInSeconds;
            //v += a*t
            this.mVelocity = this.mVelocity.add(this.mAcceleration.scale(dt));
            //s += v*t
            this.move(this.mVelocity.scale(dt));

            this.mAngularVelocity += this.mAngularAcceleration * dt;
            this.rotate(this.mAngularVelocity * dt);
        }
        const width = Engine.mWidth;
        const height = Engine.mHeight;
        if (this.mCenter.x < 0 || this.mCenter.x > width || this.mCenter.y < 0 || this.mCenter.y > height) {
            const index = Engine.mAllObjects.indexOf(this);
            if (index > -1)
                Engine.mAllObjects.splice(index, 1);
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