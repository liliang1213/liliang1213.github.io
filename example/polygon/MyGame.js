/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global height, width, gEngine */
function MyGame() {
    var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0.1);
    r1.rotate(2.8);
    var r2 = new Rectangle(new Vec2(200, 400), 400, 20, 0, 1, 0.1);
    var r3 = new Rectangle(new Vec2(100, 200), 200, 20, 0);

    var p1 = new Polygon([new Vec2(100, 200),new Vec2(200, 200),new Vec2(250, 250),new Vec2(50, 250)], 3, 300, 1);

    /*for (var i = 0; i < 1; i++) {
         //圆形调试代码
      /!*   var centerX=Math.random() * gEngine.Core.mWidth,
             centerY=Math.random() * gEngine.Core.mHeight / 2,
             radius=Math.random() * 20 + 10,
             mass=Math.random() * 30,
             friction= Math.random(),
             restitution=Math.random();

         console.log(centerX, centerY, radius, mass, friction, restitution,'centerX, centerY, radius, mass, friction, restitution')

         var r1 = new Circle(new Vec2(260.7774466923317, 53.158349874831984), 13.690461478357165 ,8.68975181178399 ,0.7357455942757951 ,0.024662666834935676);

         var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
         console.log(vx,vy,'vx,vy')
         r1.mVelocity = new Vec2(21.136934101395795, -2.480280727694577 );*!/

         //圆形正常代码
         var r1 = new Circle(new Vec2(Math.random() * gEngine.Core.mWidth, Math.random() * gEngine.Core.mHeight / 2), Math.random() * 20 + 10, Math.random() * 30, Math.random(), Math.random());
         r1.mVelocity = new Vec2(Math.random() * 60 - 30, Math.random() * 60 - 30);

         //矩形调试代码
          var centerX=Math.random() * gEngine.Core.mWidth,
          centerY=Math.random() * gEngine.Core.mHeight / 2,
          width=Math.random() * 50 + 10,
              height=Math.random() * 50 + 10,
          mass=Math.random() * 30,
          friction= Math.random(),
          restitution=Math.random();

          console.log(centerX, centerY, width,height, mass, friction, restitution,'centerX, centerY, radius, mass, friction, restitution')

          var r1 = new Rectangle(new Vec2(centerX, centerY),  width,height, mass, friction, restitution);

          var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
          console.log(vx,vy,'vx,vy')
          r1.mVelocity = new Vec2(vx,vy);


         //矩形正常代码
        /!* var r1 = new Rectangle(new Vec2(559.6844169945291, 31.316602433838884), 26.4886973392982 ,47.13979461975169 ,16.210394630327222 ,0.5568285280768372 ,0.5611291606843027 );
         r1.mVelocity = new Vec2(-27.64823839880822, 28.770085623239808);*!/
     }*/
}


