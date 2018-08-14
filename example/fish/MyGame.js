/* global height, width, gEngine */
function MyGame() {
    var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0.1);
    r1.rotate(2.8);
    const r2 = new Rectangle(new Vec2(200, 400), 400, 20, 0, 1, 0.1);
    const r3 = new Rectangle(new Vec2(100, 200), 200, 20, 0);

    const p1 = new Polygon([new Vec2(100, 200),new Vec2(200, 200),new Vec2(250, 250),new Vec2(50, 250)], 30, 300, 1);
    const p2 = new Polygon([new Vec2(350, 0),new Vec2(400, -50),new Vec2(450, 0),new Vec2(425, 100),new Vec2(375, 100)], 20,0.2, 0.3);

    for (let i = 0; i < 10; i++) {
        var centerX=Math.random() * gEngine.Core.mWidth;
        var centerY=Math.random() * gEngine.Core.mHeight / 2;
        const radius=Math.random() * 20 + 10;
        var mass=Math.random() * 30;
        var friction= Math.random();
        var restitution=Math.random();

        console.log(centerX, centerY, radius, mass, friction, restitution,'centerX, centerY, radius, mass, friction, restitution')

        /*    var r1 = new Circle(new Vec2(260.7774466923317, 53.158349874831984), 13.690461478357165 ,8.68975181178399 ,0.7357455942757951 ,0.024662666834935676);

           var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
           console.log(vx,vy,'vx,vy')
           r1.mVelocity = new Vec2(21.136934101395795, -2.480280727694577 );*/

        //圆形正常代码
        var r1 = new Circle(new Vec2(Math.random() * gEngine.Core.mWidth, Math.random() * gEngine.Core.mHeight / 2), Math.random() * 20 + 10, Math.random() * 30, Math.random(), Math.random());
        r1.mVelocity = new Vec2(Math.random() * 60 - 30, Math.random() * 60 - 30);

        //矩形调试代码
        const centerX=Math.random() * gEngine.Core.mWidth;

        const centerY=Math.random() * gEngine.Core.mHeight / 2;
        const width=Math.random() * 50 + 10;
        const height=Math.random() * 50 + 10;
        const mass=Math.random() * 30;
        const friction= Math.random();
        const restitution=Math.random();

        console.log(centerX, centerY, width,height, mass, friction, restitution,'centerX, centerY, radius, mass, friction, restitution')

        var r1 = new Rectangle(new Vec2(centerX, centerY),  width,height, mass, friction, restitution);

        const vx=Math.random() * 60 - 30;
        const vy=Math.random() * 60 - 30;
        console.log(vx,vy,'vx,vy')
        r1.mVelocity = new Vec2(vx,vy);
        //矩形正常代码
        /*       var r1 = new Rectangle(new Vec2(559.6844169945291, 31.316602433838884), 26.4886973392982 ,47.13979461975169 ,16.210394630327222 ,0.5568285280768372 ,0.5611291606843027 );
               r1.mVelocity = new Vec2(-27.64823839880822, 28.770085623239808);

              var r1 = new Rectangle(new Vec2(559.6844169945291, 31.316602433838884), 60.4886973392982 ,47.13979461975169 ,16.210394630327222 ,0.5568285280768372 ,0.5611291606843027 );
              r1.mVelocity = new Vec2(-27.64823839880822, 28.770085623239808);*/
    }
}

export default MyGame;


