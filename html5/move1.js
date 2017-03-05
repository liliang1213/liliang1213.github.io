const PARTICLE_NUM = 20;
var particles = [],renderFn,ENDPOINT;


class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10 + Math.random() * 10;
        this.angle = Math.random() * 2 * Math.PI;
        this.vx = Math.sin(this.angle) * Math.random()*2;
        this.vy = Math.cos(this.angle) * Math.random()*2;
        this.life=Math.random()*20;
        this.alpha=Math.random()*0.5+0.5;
    }

    move() {
        // this.radius+=0.5;
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        if(this.life>30){
            this.vx=(ENDPOINT.x-this.x)*0.03;
            this.vy=(ENDPOINT.y-this.y)*0.03;
        }
        if(this.life>100){
            this.alpha-=0.03;
        }
    }

    draw() {

    }

    update() {
        this.move();
    }

    render() {
        this.update();
        this.draw();
    }
}


class Drawing {
    constructor() {

    }

    init() {
        this.canvas = document.querySelector('#canvas');
        this.context = canvas.getContext('2d');
    }

    clearFrame() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getArea() {
        return {w: this.canvas.width, h: this.canvas.height};
    }

    loop(fn) {
        renderFn = !renderFn ? fn : renderFn;
        this.clearFrame();
        renderFn();
        requestFrame.call(window, this.loop.bind(this));
    }

    drawCircle(point) {
        var rGrd = this.context.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
        rGrd.addColorStop(0, new Color(255, 255, 255,point.alpha).render());
        rGrd.addColorStop(0.5, new Color(68, 68, 220,point.alpha).render());
        rGrd.addColorStop(1, 'transparent');
        this.context.fillStyle = rGrd;
        this.context.beginPath();
        this.context.arc(point.x, point.y, point.radius, 0, 2 * Math.PI, true);
        this.context.closePath();
        this.context.fill();
    }

    update(){
        this.context.globalCompositeOperation = 'lighter';
        for (var i = 0; i < particles.length; i++) {
            if(particles[i]) {
                particles[i].update();
                drawing.drawCircle(particles[i]);
                if (particles[i].alpha<=0||particles[i].x > drawing.getArea().w || particles[i].x <= 0 || particles[i].y > drawing.getArea().h || particles[i].y <= 0) {
                    particles[i] = null;
                }
            }
        }
    }
}

class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a ? a : 255;
    }

    render() {
        return 'rgba(' + this.r + ',' + +this.g + ',' + this.b + ',' + this.a + ')';
    }
}

var requestFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };


var drawing = new Drawing();
drawing.init();
ENDPOINT={
    x:drawing.getArea().w,
    y:drawing.getArea().w
};
window.addEventListener('click', function (event) {
    var mouseX=event.clientX;
    var mouseY=event.clientY;

    for (var i = 0, l = PARTICLE_NUM; i < l; i++) {
        particles.push (new Particle(mouseX, mouseY, 0, 0, 0, 0));
    }
})

drawing.loop(function () {
    drawing.update();
});