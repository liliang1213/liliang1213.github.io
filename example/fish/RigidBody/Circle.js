import RigidShape from './RigidShape';
import Vec2 from '../Lib/Vec2';

class Circle extends RigidShape{
    constructor(center, radius, mass, friction, restitution) {
        super(center, mass, friction, restitution);
        this.mType = "Circle";
        this.mRadius = radius;
        this.mBoundRadius = radius;
        this.mStartpoint = new Vec2(center.x, center.y - radius);
        this.updateInertia();
    }

    move(s) {
        this.mStartpoint = this.mStartpoint.add(s);
        this.mCenter = this.mCenter.add(s);
        return this;
    }

    draw(context) {
        context.fillStyle=this.collided?'red':'yellow';
        context.beginPath();
        context.arc(this.mCenter.x, this.mCenter.y, this.mRadius, 0, Math.PI * 2, true);
        context.moveTo(this.mStartpoint.x, this.mStartpoint.y);
        context.lineTo(this.mCenter.x, this.mCenter.y);
        context.fill();
        context.closePath();
        context.stroke();
    }

    rotate(angle) {
        this.mAngle += angle;
        this.mStartpoint = this.mStartpoint.rotate(this.mCenter, angle);
        return this;
    }

    updateInertia() {
        if (this.mInvMass === 0) {
            this.mInertia = 0;
        } else {
            // this.mInvMass is inverted!!
            // Inertia=mass * radius^2
            // 12 is a constant value that can be changed
            this.mInertia = (1 / this.mInvMass) * (this.mRadius * this.mRadius) / 12;
        }
    }

    collisionTest(otherShape, collisionInfo) {
        let status = false;
        if (otherShape.mType === "Circle") {
            status = this.collidedCircCirc(this, otherShape, collisionInfo);
        } else {
            status = otherShape.collidedRectCirc(this, collisionInfo);
        }
        return status;
    }

    collidedCircCirc(c1, c2, collisionInfo) {
        const vFrom1to2 = c2.mCenter.subtract(c1.mCenter);
        const rSum = c1.mRadius + c2.mRadius;
        const dist = vFrom1to2.length();
        //圆心距离大于半径之和
        if (dist > Math.sqrt(rSum * rSum)) {
            return false;
        }
        if (dist !== 0) {
            //有重叠但位置不同
            const normalFrom2to1 = vFrom1to2.scale(-1).normalize();
            const radiusC2 = normalFrom2to1.scale(c2.mRadius);
            collisionInfo.setInfo(rSum - dist, vFrom1to2.normalize(), c2.mCenter.add(radiusC2));
        } else {
            //位置相同
            if (c1.mRadius > c2.mRadius) {
                collisionInfo.setInfo(rSum, new Vec2(0, -1), c1.mCenter.add(new Vec2(0, c1.mRadius)));
            } else {
                collisionInfo.setInfo(rSum, new Vec2(0, -1), c2.mCenter.add(new Vec2(0, c2.mRadius)));
            }
        }
        return true;
    }
}

export default Circle;