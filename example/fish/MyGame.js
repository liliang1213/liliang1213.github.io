import Rectangle from './RigidBody/Rectangle';
import Polygon from './RigidBody/Polygon';
import EventEmitter from 'events';
import Circle from './RigidBody/Circle';
import Vec2 from './Lib/Vec2';
import Engine from './EngineCore/Core';


class MovingPath extends EventEmitter {
    constructor(opts) {
        super();
        this.params = {
            type: 'smooth',
          /*  points: [{
                x: 300,
                y: 300
            }, {
                x: 600,
                y: 100
            }]*/
            points:[{
                x:300,
                y:300
            },{
                x:600,
                y:100
            },{
                x:100,
                y:100
            },{
                x:50,
                y:600
            }]
        };
        this.status = 'start';
        this.maxSpeed = 100;
        this.obj = opts.obj;
        this.judge = null;
        this.currentPointIndex = 0;
        this.dist = this.getDist();
    }

    single(dist) {
        var obj = this.obj;
        switch (this.params.type) {
            case 'smooth':
                var desire = dist.subtract(obj.mCenter).normalize().scale(this.maxSpeed);
                var steer = desire.subtract(obj.mVelocity);
                obj.mAcceleration = steer;
                this.judge = Math.atan2(dist.y - obj.mCenter.y, dist.x - obj.mCenter.x);
                obj.rotate(Math.atan2(obj.mVelocity.y, obj.mVelocity.x));
                break;
            case 'direct':
                var desire = dist.subtract(obj.mCenter).normalize().scale(this.maxSpeed);
                obj.mVelocity = desire;
                this.judge = Math.atan2(dist.y - obj.mCenter.y, dist.x - obj.mCenter.x);
                obj.rotate(Math.atan2(obj.mVelocity.y, obj.mVelocity.x));
                break;
        }
    }

    getDist() {
        return new Vec2(this.params.points[this.currentPointIndex].x, this.params.points[this.currentPointIndex].y);
    }

    moving() {
        if (this.status == 'end') {
            return false;
        }
        var dist = this.dist;
        var obj = this.obj;

        if (Math.atan2(dist.y - obj.mCenter.y, dist.x - obj.mCenter.x) * this.judge < 0) {
            this.currentPointIndex++;
            if (this.currentPointIndex == this.params.points.length) {
                this.status = 'end';
                this.emit('end');
                return false;
            }
            this.dist = this.getDist();
        }
        this.single(this.dist);
    }
}

function MyGame() {
    var cannon = new Rectangle({
        pos: new Vec2(200, 300),
        width: 40,
        height: 40,
        mass: 0,
        friction: 1,
        restitution: 0.1,
        collisionGroup: 0
    });

    var r4 = new Rectangle(
        {
            pos: new Vec2(200, 100),
            width: 40,
            height: 20,
            mass: 0,
            friction: 1,
            restitution: 0.1
        });

    var circle = new Circle(
        {
            pos: new Vec2(260.7774466923317, 53.158349874831984),
            radius: 13.690461478357165,
            mass: 0,
            friction: 1,
            restitution: 0.1
        });

    var fish = new MovingPath({
        obj: r4
    });

    var p1=new Polygon({
        pos:new Vec2(300,300),
        vertices:[new Vec2(0,-100),new Vec2(50,-50),new Vec2(50,0),new Vec2(50,50),new Vec2(0,100),new Vec2(-50,50),new Vec2(-50,0),new Vec2(-50,-50)],
    })

    var interval = null;
    fish.on('end', function () {
        if (interval) {
            clearInterval(interval);
            // Engine.remove(r4);
            r4.setStatic();
            console.log('finished')
        }
    });

    interval = setInterval(function () {
        fish.moving()
    }, 50);

    Engine.drawing.mCanvas.onmousedown = function (event) {
        // console.log(event,"event");
        var angle = Math.atan2(event.clientY - cannon.y, event.clientX - cannon.x);
        cannon.rotate(angle);
        var circleangle=Math.atan2(event.clientY - circle.y, event.clientX - circle.x);
        circle.rotate(circleangle);
        var bullet = new Rectangle(
            {
                pos: new Vec2(200, 300),
                width: 40,
                height: 20,
                mass: 0,
                friction: 1,
                restitution: 0.1,
                collisionGroup:2
            });

        var bulletVelocity = new Vec2(event.clientX, event.clientY).subtract(bullet.mCenter).normalize().scale(300);
        bullet.rotate(angle);
        bullet.mVelocity = bulletVelocity;
        bullet.addCollisionListener(function (obj) {
            Engine.removeCollisionList(obj);
            console.log(obj, "obj");
        });

        bullet.on('update',(bullet)=>{
            let width = Engine.width;
            let height = Engine.height;
            if (bullet.x< 0 || bullet.x > width) {
                bullet.mVelocity.x=-bullet.mVelocity.x;
                bullet.rotate(Math.atan2(bullet.mVelocity.y,bullet.mVelocity.x))
            }

            if(bullet.y< 0 || bullet.y> height){
                bullet.mVelocity.y=-bullet.mVelocity.y;
                bullet.rotate(Math.atan2(bullet.mVelocity.y,bullet.mVelocity.x))
            }
        })
    }
}


export default MyGame;


