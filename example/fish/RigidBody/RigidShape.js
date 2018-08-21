import Vec2 from '../Lib/Vec2';
import Engine from '../EngineCore/Core';
import EventEmitter from 'events';

class RigidShape extends EventEmitter{
    constructor(opts) {
        let mass=opts.mass;
        let friction=opts.friction;
        let restitution=opts.restitution;
        super();
        this.mCenter = opts.pos;
        this.x=this.mCenter.x;
        this.y=this.mCenter.y;
        this.mInertia = 0;
        this.collisionGroup=opts.collisionGroup||1;
        this.collided=false;
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
            this.mAcceleration = Engine.gravity;
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

    setStatic(){
        this.mAcceleration.x=0;
        this.mAcceleration.y=0;
        this.mVelocity.x=0;
        this.mVelocity.y=0;
    }

    update() {
        if (Engine.mMovement) {
            const dt = Engine.mUpdateIntervalInSeconds;
            //v += a*t
            this.mVelocity = this.mVelocity.add(this.mAcceleration.scale(dt));
            //s += v*t
            this.move(this.mVelocity.scale(dt));

           /* this.mAngularVelocity += this.mAngularAcceleration * dt;
            this.rotate(this.mAngularVelocity * dt);*/
        }
        this.emit('update',this);
    }

    boundTest(otherShape) {
        const vFrom1to2 = otherShape.mCenter.subtract(this.mCenter);
        const rSum = this.mBoundRadius + otherShape.mBoundRadius;
        const dist = vFrom1to2.length();
        if (dist > rSum) {
            return false;
        }
        return true;
    }

    addCollisionListener(callback){
        if(typeof callback!='function'){
            console.error('No collision callback function');
        }
        Engine.addCollisionList(this);
        let collisionCb=function(){
            let args=Array.prototype.slice.call(arguments)
            callback.apply(this,args)
            this.removeListener('collision',collisionCb);
        };
        this.on('collision',collisionCb);

    }
}

export default RigidShape;