// S vector.js

var Vector = function(point) {
    if (point === undefined) {
        this.x = 0;
        this.y = 0;
    }
    else {
        this.x = point.x;
        this.y = point.y;
    }
}

Vector.prototype = {
    // 获取向量大小
    getMagnitude: function() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    },

    add: function(vector) {
        var v = new Vector()
        v.x = this.x + vector.x
        v.y = this.y + vector.y
        return v
    },

    subtract: function(vector) {
        var v = new Vector()
        v.x = this.x - vector.x
        v.y = this.y - vector.y
        return v
    },

    dotProduct: function(vector) {
        return this.x * vector.x + this.y * vector.y
    },

    // 由两点生成边
    edge: function(vector) {
        return this.subtract(vector)
    },

    // 垂直，即投影轴
    perpendicular: function() {
        var v = new Vector()
        v.x = this.y
        v.y = 0 - this.x
        return v
    },

    normalize: function() {
        var v = new Vector(0, 0),
            m = this.getMagnitude()

        if(m !== 0) {
            v.x = this.x / m
            v.y = this.y /m
        }
        return v
    },

    // 投影轴的单位向量
    normal: function() {
        var p = this.perpendicular()
        return p.normalize()
    }
}
// E vector.js

// S projection.js
var Projection = function(min, max) {
    this.min = min
    this.max = max
}

Projection.prototype = {
    overlaps: function(projection) {
        return this.max > projection.min && projection.max > this.min
    }
}
// E projection.js


// S shape.js
var Shape = function() {
    this.x = undefined
    this.y = undefined
    this.strokeStyle = 'rgba(255, 253, 208, 0.9)'
    this.fillStyle = 'rgba(147, 147, 147, .8)'
}

Shape.prototype = {
    collidesWith: function(shape) {
        var axes = this.getAxes().concat(shape.getAxes())
        return !this.separationOnAxes(axes, shape)
    },

    separationOnAxes: function(axes, shape) {
        for(var i = 0, len = axes.length; i < len; i++) {
            axis = axes[i]
            projection1 = shape.project(axis)
            projection2 = this.project(axis)

            if(!projection1.overlaps(projection2)) {
                return true
            }
        }
        return false
    },

    project: function(axis) {
        throw 'project(axis) not implemented'
    },

    getAxes: function() {
        throw 'getAxes() not implemented'
    },

    move: function(dx, dy) {
        throw 'move(dx, dy) not implemented'
    },

    // Drawing methods................................

    createPath: function(context) {
        throw 'createPath(context) not implemented'
    },

    fill: function(context) {
        context.save()
        context.fillStyle = this.fillStyle
        this.createPath(context)
        context.fill()
        context.restore()
    },

    stroke: function(context) {
        context.save()
        context.strokeStyle = this.strokeStyle
        this.createPath(context)
        context.stroke()
        context.restore()
    },

    isPointInPath: function(context, x, y) {
        this.createPath(context)
        return context.isPointInPath(x, y)
    }
}
// E shape.js

// S polygon.js
var Point = function(x, y) {
    this.x = x
    this.y = y
}

var Polygon = function() {
    this.points = []
    this.strokeStyle = 'blue'
    this.fillStyle = 'white'
}

Polygon.prototype = new Shape()

Polygon.prototype.getAxes = function() {
    var v1 = new Vector(),
        v2 = new Vector(),
        axes = []

    for(var i = 0, len = this.points.length - 1; i < len; i++) {
        v1.x = this.points[i].x
        v1.y = this.points[i].y

        v2.x = this.points[i + 1].x
        v2.y = this.points[i + 1].y

        axes.push(v1.edge(v2).normal())
    }

    v1.x = this.points[this.points.length - 1].x
    v1.y = this.points[this.points.length - 1].y

    v2.x = this.points[0].x
    v2.y = this.points[0].y

    axes.push(v1.edge(v2).normal())

    return axes
}

Polygon.prototype.project = function(axis) {
    var scalars = [],
        v = new Vector()

    this.points.forEach(function(point) {
        v.x = point.x
        v.y = point.y
        scalars.push(v.dotProduct(axis))
    })

    return new Projection(Math.min.apply(Math, scalars),
        Math.max.apply(Math, scalars))
}

Polygon.prototype.addPoint = function(x, y) {
    this.points.push(new Point(x, y))
}

Polygon.prototype.createPath = function(context) {
    if(this.points.length === 0) {
        return
    }

    context.beginPath()
    context.moveTo(this.points[0].x,
        this.points[0].y)

    for(var i = 0, len = this.points.length; i < len; i++) {
        context.lineTo(this.points[i].x,
            this.points[i].y)
    }

    context.closePath()
}

Polygon.prototype.move = function(dx, dy) {
    for(var i = 0, point, len = this.points.length; i < len; i++) {
        point = this.points[i]
        point.x += dx
        point.y += dy
    }
}

Polygon.prototype.collidesWith = function(shape) {
    var axes = shape.getAxes()
    if(axes === undefined) {
        return polygonCollidesWithCircle(this, shape)
    } else {
        axes = axes.concat(this.getAxes())
        return !this.separationOnAxes(axes, shape)
    }
}

// E polygon.js

// S circle.js
var Circle = function(x, y, radius) {
    this.x = x
    this.y = y
    this.radius = radius
    this.strokeStyle = 'rgba(255, 253, 208, .9)'
    this.fillStyle = 'rgba(147, 197, 114, .8)'
}

Circle.prototype = new Shape()

Circle.prototype.collidesWith = function(shape) {
    var point, length, min = 10000, v1, v2,
        edge, perpendicular, normal,
        axes = shape.getAxes(), distance

    if(axes === undefined) {
        distance = Math.sqrt(Math.pow(shape.x - this.x, 2) +
            Math.pow(shape.y - this.y, 2))

        return distance < Math.abs(this.radius + shape.radius)
    } else {
        return polygonCollidesWithCircle(shape, this)
    }
}

Circle.prototype.getAxes = function() {
    return undefined
}

Circle.prototype.project = function(axis) {
    var scalars = [],
        point = new Point(this.x, this.y),
        dotProduct = new Vector(point).dotProduct(axis)

    scalars.push(dotProduct)
    scalars.push(dotProduct + this.radius)
    scalars.push(dotProduct - this.radius)

    return new Projection(Math.min.apply(Math, scalars),
        Math.max.apply(Math, scalars))
}

Circle.prototype.move = function(dx, dy) {
    this.x += dx
    this.y += dy
}

Circle.prototype.createPath = function(context) {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
}

function getPolygonPointClosestToCircle(polygon, circle) {
    var min = 10000,
        length, testPoint, closestPoint

    for(var i = 0, len = polygon.points.length; i < len; i++) {
        testPoint = polygon.points[i]
        length = Math.sqrt(Math.pow(testPoint.x - circle.x, 2),
            Math.pow(testPoint.y - circle.y, 2))

        if(length < min) {
            min = length
            closestPoint = testPoint
        }
    }

    return closestPoint
}

function polygonCollidesWithCircle(polygon, circle) {
    var min = 10000, v1, v2,
        edge, perpendicular,
        axes = polygon.getAxes(),
        closestPoint = getPolygonPointClosestToCircle(polygon, circle)
    v1 = new Vector(new Point(circle.x, circle.y))
    v2 = new Vector(new Point(closestPoint.x, closestPoint.y))
    axes.push(v1.subtract(v2).normalize())
    return !polygon.separationOnAxes(axes, circle)
}
// E circle.js


// S index.js
var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    shapes = [],
    polygonPoints = [
        [ new Point(250, 150), new Point(250, 250),
            new Point(350, 250) ],

        [ new Point(100, 100), new Point(100, 150),
            new Point(150, 150), new Point(150, 100) ],

        [ new Point(400, 100), new Point(380, 150),
            new Point(500, 150), new Point(520, 100) ]
    ],

    polygonStrokeStyles = [ 'blue', 'yellow', 'red'],
    polygonFillStyles   = [ 'rgba(255,255,0,0.7)',
        'rgba(100,140,230,0.6)',
        'rgba(255,255,255,0.8)' ],

    circle1 = new Circle(150, 75, 20),
    circle2 = new Circle(350, 45, 30),

    mousedown = { x: 0, y: 0 },
    lastdrag = { x: 0, y: 0 },
    shapeBeingDragged = undefined;

// Functions.....................................................

function windowToCanvas(e) {
    var x = e.x || e.clientX,
        y = e.y || e.clientY,
        bbox = canvas.getBoundingClientRect();

    return { x: x - bbox.left * (canvas.width  / bbox.width),
        y: y - bbox.top  * (canvas.height / bbox.height)
    };
};

function drawShapes() {
    shapes.forEach( function (shape) {
        shape.stroke(context);
        shape.fill(context);
    });
}
function detectCollisions() {
    var textY = 30,
        numShapes = shapes.length,
        shape,
        i;

    if (shapeBeingDragged) {
        for(i = 0; i < numShapes; ++i) {
            shape = shapes[i];

            if (shape !== shapeBeingDragged) {
                if (shapeBeingDragged.collidesWith(shape)) {
                    context.fillStyle = shape.fillStyle;
                    context.fillText('collision', 20, textY);
                    textY += 40;
                }
            }
        }
    }
}


// Event handlers................................................

canvas.onmousedown = function (e) {
    var location = windowToCanvas(e);

    shapes.forEach( function (shape) {
        if (shape.isPointInPath(context, location.x, location.y)) {
            shapeBeingDragged = shape;
            mousedown.x = location.x;
            mousedown.y = location.y;
            lastdrag.x = location.x;
            lastdrag.y = location.y;
        }
    });
}

canvas.onmousemove = function (e) {
    var location,
        dragVector;

    if (shapeBeingDragged !== undefined) {
        location = windowToCanvas(e);
        dragVector = { x: location.x - lastdrag.x,
            y: location.y - lastdrag.y
        };

        shapeBeingDragged.move(dragVector.x, dragVector.y);

        lastdrag.x = location.x;
        lastdrag.y = location.y;

        context.clearRect(0,0,canvas.width,canvas.height);
        drawShapes();
        detectCollisions();
    }
}

canvas.onmouseup = function (e) {
    shapeBeingDragged = undefined;
}

for (var i=0; i < polygonPoints.length; ++i) {
    var polygon = new Polygon(),
        points = polygonPoints[i];

    polygon.strokeStyle = polygonStrokeStyles[i];
    polygon.fillStyle = polygonFillStyles[i];

    points.forEach( function (point) {
        polygon.addPoint(point.x, point.y);
    });

    shapes.push(polygon);
}

// Initialization................................................

shapes.push(circle1)
shapes.push(circle2)

context.shadowColor = 'rgba(100,140,255,0.5)';
context.shadowBlur = 4;
context.shadowOffsetX = 2;
context.shadowOffsetY = 2;
context.font = '38px Arial';

drawShapes();

context.save();
context.fillStyle = 'cornflowerblue';
context.font = '24px Arial';
context.fillText('拖拽物体', 10, 25);
context.restore();