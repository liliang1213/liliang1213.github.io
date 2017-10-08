/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global height, width, gEngine */
function MyGame() {
    var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0);
    r1.rotate(2.8);
    var r2 = new Rectangle(new Vec2(200, 400), 400, 20, 0, 1, 0.5);
    var r3 = new Rectangle(new Vec2(100, 200), 200, 20, 0);

     for (var i = 0; i < 1; i++) {
     /*    var centerX=Math.random() * gEngine.Core.mWidth,centerY=Math.random() * gEngine.Core.mHeight / 2, width=Math.random() * 50 + 10, height=Math.random() * 50 + 10, mass=Math.random() * 30, friction= Math.random(), restitution=Math.random()
    console.log(centerX, centerY, width, height, mass, friction, restitution,'centerX, centerY, width, height, mass, friction, restitution')
         var r1 = new Circle(new Vec2(centerX, centerY), width, height, mass, friction, restitution);
    var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
    console.log(vx,vy,'vx,vy')
    r1.mVelocity = new Vec2(vx,vy);*/

         var centerX=Math.random() * gEngine.Core.mWidth,centerY=Math.random() * gEngine.Core.mHeight / 2, width=Math.random() * 50 + 10, height=Math.random() * 50 + 10, mass=Math.random() * 30, friction= Math.random(), restitution=Math.random()
         // console.log(centerX, centerY, width, height, mass, friction, restitution,'centerX, centerY, width, height, mass, friction, restitution')
         var r1 = new Circle(new Vec2(294.09700358065504, 9.19856278588465), 14.643884074619542 ,51.4548070382139, 7.839643918318869,0.9182862212159124 ,0.6074265636622134);
         // var vx=Math.random() * 60 - 30,vy=Math.random() * 60 - 30;
         // console.log(vx,vy,'vx,vy')
         r1.mVelocity = new Vec2(4.690833977680839 ,60.409821610408308);
     }
}


