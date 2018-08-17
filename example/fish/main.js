import MyGame from './MyGame.js';
import Engine from './EngineCore/Core';
import Vec2 from './Lib/Vec2';

Engine.init({
    gravity:new Vec2(0, 0),
    collisionResolve:false
});
MyGame();
