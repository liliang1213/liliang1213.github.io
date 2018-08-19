import Rectangle from './RigidBody/Rectangle';
import Polygon from './RigidBody/Polygon';
import EventEmitter from 'events';
import Circle from './RigidBody/Circle';
import Vec2 from './Lib/Vec2';
import Engine from './EngineCore/Core';


class MovingPath extends EventEmitter{
    constructor(opts){
        super();
        this.params={
            type:'smooth',
            points:[{
                x:300,
                y:300
            },{
                x:600,
                y:100
            }]
            /*points:[{
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
            }]*/
        };
        this.status='start';
        this.maxSpeed=100;
        this.obj=opts.obj;
        this.judge=null;
        this.currentPointIndex=0;
        this.dist=this.getDist();
    }

    single(dist){
        var obj=this.obj;
        switch(this.params.type) {
            case 'smooth':
                var desire = dist.subtract(obj.mCenter).normalize().scale(this.maxSpeed);
                var steer = desire.subtract(obj.mVelocity);
                obj.mAcceleration = steer;
                this.judge = Math.atan2(dist.y - obj.mCenter.y, dist.x - obj.mCenter.x);
                obj.rotate(Math.atan2(obj.mVelocity.y, obj.mVelocity.x) - obj.mAngle);
                break;
            case 'direct':
                var desire = dist.subtract(obj.mCenter).normalize().scale(this.maxSpeed);
                obj.mVelocity=desire;
                this.judge = Math.atan2(dist.y - obj.mCenter.y, dist.x - obj.mCenter.x);
                obj.rotate(Math.atan2(obj.mVelocity.y, obj.mVelocity.x) - obj.mAngle);
                break;
        }
    }

    getDist(){
        return new Vec2(this.params.points[this.currentPointIndex].x,this.params.points[this.currentPointIndex].y);
    }

    moving(){
        if(this.status=='end'){
            return false;
        }
        var dist=this.dist;
        var obj=this.obj;

        if(Math.atan2(dist.y-obj.mCenter.y,dist.x-obj.mCenter.x)*this.judge<0) {
            this.currentPointIndex++;
            if(this.currentPointIndex==this.params.points.length){
                this.status='end';
                this.emit('end');
                return false;
            }
            this.dist=this.getDist();
        }
        this.single(this.dist);
    }
}

function MyGame() {
    var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0.1);
    r1.rotate(2.8);
    var r2 = new Rectangle(new Vec2(200, 300), 400, 20, 0, 1, 0.1);
    var r3 = new Rectangle(new Vec2(100, 150), 200, 20, 0);

    var p1 = new Polygon([new Vec2(100, 200),new Vec2(200, 200),new Vec2(250, 250),new Vec2(50, 250)], 30, 300, 1);
    var p2 = new Polygon([new Vec2(350, 0),new Vec2(400, -50),new Vec2(450, 0),new Vec2(425, 100),new Vec2(375, 100)], 20,0.2, 0.3);

    var r4 = new Rectangle(new Vec2(200, 100), 40, 20, 0, 1, 0.1);

    var circle = new Circle(new Vec2(260.7774466923317, 53.158349874831984), 13.690461478357165 ,8.68975181178399 ,0.7357455942757951 ,0.024662666834935676);

    var fish=new MovingPath({
        obj:r4
    });
    var interval=null;
    fish.on('end',function(){
        if(interval) {
            clearInterval(interval);
            // Engine.remove(r4);
            r4.setStatic();
            console.log('finished')
        }
    });
    interval=setInterval(function(){
        fish.moving()
    },50);


   /* for (var i = 0; i < 2; i++) {
        var centerX=Math.random() * Engine.mWidth,
            centerY=Math.random() * Engine.mHeight / 2,
            radius=Math.random() * 20 + 10,
            mass=Math.random() * 30,
            friction= Math.random(),
            restitution=Math.random();



        //圆形正常代码
        var r2 = new Circle(new Vec2(Math.random() * Engine.mWidth, Math.random() * Engine.mHeight / 2), Math.random() * 20 + 10, Math.random() * 30, Math.random(), Math.random());
        r2.mVelocity = new Vec2(Math.random() * 60 - 30, Math.random() * 60 - 30);

        //矩形调试代码
        var centerX=Math.random() * Engine.mWidth,
            centerY=Math.random() * Engine.mHeight / 2,
            width=Math.random() * 50 + 10,
            height=Math.random() * 50 + 10,
            mass=Math.random() * 30,
            friction= Math.random(),
            restitution=Math.random();


        var r3 = new Rectangle(new Vec2(centerX, centerY),  width,height, mass, friction, restitution);

        var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
        r3.mVelocity = new Vec2(vx,vy);

        //矩形正常代码
        /!*       var r1 = new Rectangle(new Vec2(559.6844169945291, 31.316602433838884), 26.4886973392982 ,47.13979461975169 ,16.210394630327222 ,0.5568285280768372 ,0.5611291606843027 );
         r1.mVelocity = new Vec2(-27.64823839880822, 28.770085623239808);

         var r1 = new Rectangle(new Vec2(559.6844169945291, 31.316602433838884), 60.4886973392982 ,47.13979461975169 ,16.210394630327222 ,0.5568285280768372 ,0.5611291606843027 );
         r1.mVelocity = new Vec2(-27.64823839880822, 28.770085623239808);*!/
    }*/
}


export default MyGame;


