import Rectangle from './RigidBody/Rectangle';
import Polygon from './RigidBody/Polygon';
import Circle from './RigidBody/Circle';
import Vec2 from './Lib/Vec2';
import Engine from './EngineCore/Core';



function MyGame() {
    var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0.1);
    r1.rotate(2.8);
    var r2 = new Rectangle(new Vec2(200, 400), 400, 20, 0, 1, 0.1);
    var r3 = new Rectangle(new Vec2(100, 200), 200, 20, 0);

    var p1 = new Polygon([new Vec2(100, 200),new Vec2(200, 200),new Vec2(250, 250),new Vec2(50, 250)], 30, 300, 1);
    var p2 = new Polygon([new Vec2(350, 0),new Vec2(400, -50),new Vec2(450, 0),new Vec2(425, 100),new Vec2(375, 100)], 20,0.2, 0.3);

    var r4 = new Rectangle(new Vec2(200, 100), 40, 20, 0, 1, 0.1);


    r4.rotate(Math.atan2(400-r4.mCenter.y,500-r4.mCenter.x))
    // r4.mVelocity=new Vec2(21.136934101395795, -2.480280727694577 );

    var p=1;
    setInterval(function(){
        if(r4.mCenter.x<500&&p==1) {
            var dist=new Vec2(500,400);
            var desire = dist.subtract(r4.mCenter);
            r4.mAcceleration = desire.subtract(r4.mVelocity);
            var steer=r4.mAcceleration.normalize().scale(30);
            r4.mAngularAcceleration=((r4.mVertex[1].add(r4.mVertex[2]).scale(0.5).subtract(r4.mCenter)).cross(steer)/1000);
        }else{
            p=2;
            var dist=new Vec2(200,300);
            var desire = dist.subtract(r4.mCenter);
            r4.mAcceleration = desire.subtract(r4.mVelocity);
            var steer=r4.mAcceleration.normalize().scale(30);
            r4.mAngularAcceleration=((r4.mVertex[1].add(r4.mVertex[2]).scale(0.5).subtract(r4.mCenter)).cross(steer)/1000);
        }
    },50);


   /* for (var i = 0; i < 2; i++) {
        var centerX=Math.random() * Engine.mWidth,
            centerY=Math.random() * Engine.mHeight / 2,
            radius=Math.random() * 20 + 10,
            mass=Math.random() * 30,
            friction= Math.random(),
            restitution=Math.random();


       /!* var r1 = new Circle(new Vec2(260.7774466923317, 53.158349874831984), 13.690461478357165 ,8.68975181178399 ,0.7357455942757951 ,0.024662666834935676);

         var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
         r1.mVelocity = new Vec2(21.136934101395795, -2.480280727694577 );*!/

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


