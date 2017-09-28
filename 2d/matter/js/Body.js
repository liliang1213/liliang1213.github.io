var Body = {};

define('Body',function(require, exports, module) {

    /**
     * The `Matter.Body` module contains methods for creating and manipulating body models.
     * A `Matter.Body` is a rigid body that can be simulated by a `Matter.Engine`.
     * Factories for commonly used body configurations (such as rectangles, circles and other polygons) can be found in the module `Matter.Bodies`.
     *
     * See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).

     * @class Body
     */

    var Vertices = require('../geometry/Vertices');
    var Vector = require('../geometry/Vector');
    var Sleeping = require('../core/Sleeping');
    var Render = require('../render/Render');
    var Common = require('../core/Common');
    var Bounds = require('../geometry/Bounds');
    var Axes = require('../geometry/Axes');


        Body._inertiaScale = 4;
        Body._nextCollidingGroupId = 1;
        Body._nextNonCollidingGroupId = -1;
        Body._nextCategory = 0x0001;

        /**
         * Creates a new rigid body model. The options parameter is an object that specifies any properties you wish to override the defaults.
         * All properties have default values, and many are pre-calculated automatically based on other properties.
         * Vertices must be specified in clockwise order.
         * See the properties section below for detailed information on what you can pass via the `options` object.
         * @method create
         * @param {} options
         * @return {body} body
         */
        Body.create = function(options) {
            var defaults = {
                id: Common.nextId(),
                type: 'body',
                label: 'Body',
                parts: [],
                plugin: {},
                angle: 0,
                vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40'),
                position: { x: 0, y: 0 },
                force: { x: 0, y: 0 },
                torque: 0,
                positionImpulse: { x: 0, y: 0 },
                constraintImpulse: { x: 0, y: 0, angle: 0 },
                totalContacts: 0,
                speed: 0,
                angularSpeed: 0,
                velocity: { x: 0, y: 0 },
                angularVelocity: 0,
                isSensor: false,
                isStatic: false,
                isSleeping: false,
                motion: 0,
                sleepThreshold: 60,
                density: 0.001,
                restitution: 0,
                friction: 0.1,
                frictionStatic: 0.5,
                frictionAir: 0.01,
                collisionFilter: {
                    category: 0x0001,
                    mask: 0xFFFFFFFF,
                    group: 0
                },
                slop: 0.05,
                timeScale: 1,
                render: {
                    visible: true,
                    opacity: 1,
                    sprite: {
                        xScale: 1,
                        yScale: 1,
                        xOffset: 0,
                        yOffset: 0
                    },
                    lineWidth: 0
                }
            };

            var body = Common.extend(defaults, options);

            _initProperties(body, options);

            return body;
        };

        /**
         * Returns the next unique group index for which bodies will collide.
         * If `isNonColliding` is `true`, returns the next unique group index for which bodies will _not_ collide.
         * See `body.collisionFilter` for more information.
         * @method nextGroup
         * @param {bool} [isNonColliding=false]
         * @return {Number} Unique group index
         */
        Body.nextGroup = function(isNonColliding) {
            if (isNonColliding)
                return Body._nextNonCollidingGroupId--;

            return Body._nextCollidingGroupId++;
        };

        /**
         * Returns the next unique category bitfield (starting after the initial default category `0x0001`).
         * There are 32 available. See `body.collisionFilter` for more information.
         * @method nextCategory
         * @return {Number} Unique category bitfield
         */
        Body.nextCategory = function() {
            Body._nextCategory = Body._nextCategory << 1;
            return Body._nextCategory;
        };

        /**
         * Initialises body properties.
         * @method _initProperties
         * @private
         * @param {body} body
         * @param {} [options]
         */
        var _initProperties = function(body, options) {
            options = options || {};

            // init required properties (order is important)
            Body.set(body, {
                bounds: body.bounds || Bounds.create(body.vertices),
                positionPrev: body.positionPrev || Vector.clone(body.position),
                anglePrev: body.anglePrev || body.angle,
                vertices: body.vertices,
                parts: body.parts || [body],
                isStatic: body.isStatic,
                isSleeping: body.isSleeping,
                parent: body.parent || body
            });

            Vertices.rotate(body.vertices, body.angle, body.position);
            Axes.rotate(body.axes, body.angle);
            Bounds.update(body.bounds, body.vertices, body.velocity);

            // allow options to override the automatically calculated properties
            Body.set(body, {
                axes: options.axes || body.axes,
                area: options.area || body.area,
                mass: options.mass || body.mass,
                inertia: options.inertia || body.inertia
            });

            // render properties
            var defaultFillStyle = (body.isStatic ? '#2e2b44' : Common.choose(['#006BA6', '#0496FF', '#FFBC42', '#D81159', '#8F2D56'])),
                defaultStrokeStyle = '#000';
            body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
            body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
            body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
            body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
        };

        /**
         * Given a property and a value (or map of), sets the property(s) on the body, using the appropriate setter functions if they exist.
         * Prefer to use the actual setter functions in performance critical situations.
         * @method set
         * @param {body} body
         * @param {} settings A property name (or map of properties and values) to set on the body.
         * @param {} value The value to set if `settings` is a single property name.
         */
        Body.set = function(body, settings, value) {
            var property;

            if (typeof settings === 'string') {
                property = settings;
                settings = {};
                settings[property] = value;
            }

            for (property in settings) {
                value = settings[property];

                if (!settings.hasOwnProperty(property))
                    continue;

                switch (property) {

                    case 'isStatic':
                        Body.setStatic(body, value);
                        break;
                    case 'isSleeping':
                        Sleeping.set(body, value);
                        break;
                    case 'mass':
                        Body.setMass(body, value);
                        break;
                    case 'density':
                        Body.setDensity(body, value);
                        break;
                    case 'inertia':
                        Body.setInertia(body, value);
                        break;
                    case 'vertices':
                        Body.setVertices(body, value);
                        break;
                    case 'position':
                        Body.setPosition(body, value);
                        break;
                    case 'angle':
                        Body.setAngle(body, value);
                        break;
                    case 'velocity':
                        Body.setVelocity(body, value);
                        break;
                    case 'angularVelocity':
                        Body.setAngularVelocity(body, value);
                        break;
                    case 'parts':
                        Body.setParts(body, value);
                        break;
                    default:
                        body[property] = value;

                }
            }
        };

        /**
         * Sets the body as static, including isStatic flag and setting mass and inertia to Infinity.
         * @method setStatic
         * @param {body} body
         * @param {bool} isStatic
         */
        Body.setStatic = function(body, isStatic) {
            for (var i = 0; i < body.parts.length; i++) {
                var part = body.parts[i];
                part.isStatic = isStatic;

                if (isStatic) {
                    part._original = {
                        restitution: part.restitution,
                        friction: part.friction,
                        mass: part.mass,
                        inertia: part.inertia,
                        density: part.density,
                        inverseMass: part.inverseMass,
                        inverseInertia: part.inverseInertia
                    };

                    part.restitution = 0;
                    part.friction = 1;
                    part.mass = part.inertia = part.density = Infinity;
                    part.inverseMass = part.inverseInertia = 0;

                    part.positionPrev.x = part.position.x;
                    part.positionPrev.y = part.position.y;
                    part.anglePrev = part.angle;
                    part.angularVelocity = 0;
                    part.speed = 0;
                    part.angularSpeed = 0;
                    part.motion = 0;
                } else if (part._original) {
                    part.restitution = part._original.restitution;
                    part.friction = part._original.friction;
                    part.mass = part._original.mass;
                    part.inertia = part._original.inertia;
                    part.density = part._original.density;
                    part.inverseMass = part._original.inverseMass;
                    part.inverseInertia = part._original.inverseInertia;

                    delete part._original;
                }
            }
        };

        /**
         * Sets the mass of the body. Inverse mass and density are automatically updated to reflect the change.
         * @method setMass
         * @param {body} body
         * @param {number} mass
         */
        Body.setMass = function(body, mass) {
            body.mass = mass;
            body.inverseMass = 1 / body.mass;
            body.density = body.mass / body.area;
        };

        /**
         * Sets the density of the body. Mass is automatically updated to reflect the change.
         * @method setDensity
         * @param {body} body
         * @param {number} density
         */
        Body.setDensity = function(body, density) {
            Body.setMass(body, density * body.area);
            body.density = density;
        };

        /**
         * Sets the moment of inertia (i.e. second moment of area) of the body of the body.
         * Inverse inertia is automatically updated to reflect the change. Mass is not changed.
         * @method setInertia
         * @param {body} body
         * @param {number} inertia
         */
        Body.setInertia = function(body, inertia) {
            body.inertia = inertia;
            body.inverseInertia = 1 / body.inertia;
        };

        /**
         * Sets the body's vertices and updates body properties accordingly, including inertia, area and mass (with respect to `body.density`).
         * Vertices will be automatically transformed to be orientated around their centre of mass as the origin.
         * They are then automatically translated to world space based on `body.position`.
         *
         * The `vertices` argument should be passed as an array of `Matter.Vector` points (or a `Matter.Vertices` array).
         * Vertices must form a convex hull, concave hulls are not supported.
         *
         * @method setVertices
         * @param {body} body
         * @param {vector[]} vertices
         */
        Body.setVertices = function(body, vertices) {
            // change vertices
            if (vertices[0].body === body) {
                body.vertices = vertices;
            } else {
                body.vertices = Vertices.create(vertices, body);
            }

            // update properties
            body.axes = Axes.fromVertices(body.vertices);
            body.area = Vertices.area(body.vertices);
            Body.setMass(body, body.density * body.area);

            // orient vertices around the centre of mass at origin (0, 0)
            var centre = Vertices.centre(body.vertices);
            Vertices.translate(body.vertices, centre, -1);

            // update inertia while vertices are at origin (0, 0)
            Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));

            // update geometry
            Vertices.translate(body.vertices, body.position);
            Bounds.update(body.bounds, body.vertices, body.velocity);
        };

        /**
         * Sets the parts of the `body` and updates mass, inertia and centroid.
         * Each part will have its parent set to `body`.
         * By default the convex hull will be automatically computed and set on `body`, unless `autoHull` is set to `false.`
         * Note that this method will ensure that the first part in `body.parts` will always be the `body`.
         * @method setParts
         * @param {body} body
         * @param [body] parts
         * @param {bool} [autoHull=true]
         */
        Body.setParts = function(body, parts, autoHull) {
            var i;

            // add all the parts, ensuring that the first part is always the parent body
            parts = parts.slice(0);
            body.parts.length = 0;
            body.parts.push(body);
            body.parent = body;

            for (i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part !== body) {
                    part.parent = body;
                    body.parts.push(part);
                }
            }

            if (body.parts.length === 1)
                return;

            autoHull = typeof autoHull !== 'undefined' ? autoHull : true;

            // find the convex hull of all parts to set on the parent body
            if (autoHull) {
                var vertices = [];
                for (i = 0; i < parts.length; i++) {
                    vertices = vertices.concat(parts[i].vertices);
                }

                Vertices.clockwiseSort(vertices);

                var hull = Vertices.hull(vertices),
                    hullCentre = Vertices.centre(hull);

                Body.setVertices(body, hull);
                Vertices.translate(body.vertices, hullCentre);
            }

            // sum the properties of all compound parts of the parent body
            var total = _totalProperties(body);

            body.area = total.area;
            body.parent = body;
            body.position.x = total.centre.x;
            body.position.y = total.centre.y;
            body.positionPrev.x = total.centre.x;
            body.positionPrev.y = total.centre.y;

            Body.setMass(body, total.mass);
            Body.setInertia(body, total.inertia);
            Body.setPosition(body, total.centre);
        };

        /**
         * Sets the position of the body instantly. Velocity, angle, force etc. are unchanged.
         * @method setPosition
         * @param {body} body
         * @param {vector} position
         */
        Body.setPosition = function(body, position) {
            var delta = Vector.sub(position, body.position);
            body.positionPrev.x += delta.x;
            body.positionPrev.y += delta.y;

            for (var i = 0; i < body.parts.length; i++) {
                var part = body.parts[i];
                part.position.x += delta.x;
                part.position.y += delta.y;
                Vertices.translate(part.vertices, delta);
                Bounds.update(part.bounds, part.vertices, body.velocity);
            }
        };

        /**
         * Sets the angle of the body instantly. Angular velocity, position, force etc. are unchanged.
         * @method setAngle
         * @param {body} body
         * @param {number} angle
         */
        Body.setAngle = function(body, angle) {
            var delta = angle - body.angle;
            body.anglePrev += delta;

            for (var i = 0; i < body.parts.length; i++) {
                var part = body.parts[i];
                part.angle += delta;
                Vertices.rotate(part.vertices, delta, body.position);
                Axes.rotate(part.axes, delta);
                Bounds.update(part.bounds, part.vertices, body.velocity);
                if (i > 0) {
                    Vector.rotateAbout(part.position, delta, body.position, part.position);
                }
            }
        };

        /**
         * Sets the linear velocity of the body instantly. Position, angle, force etc. are unchanged. See also `Body.applyForce`.
         * @method setVelocity
         * @param {body} body
         * @param {vector} velocity
         */
        Body.setVelocity = function(body, velocity) {
            body.positionPrev.x = body.position.x - velocity.x;
            body.positionPrev.y = body.position.y - velocity.y;
            body.velocity.x = velocity.x;
            body.velocity.y = velocity.y;
            body.speed = Vector.magnitude(body.velocity);
        };

        /**
         * Sets the angular velocity of the body instantly. Position, angle, force etc. are unchanged. See also `Body.applyForce`.
         * @method setAngularVelocity
         * @param {body} body
         * @param {number} velocity
         */
        Body.setAngularVelocity = function(body, velocity) {
            body.anglePrev = body.angle - velocity;
            body.angularVelocity = velocity;
            body.angularSpeed = Math.abs(body.angularVelocity);
        };

        /**
         * Moves a body by a given vector relative to its current position, without imparting any velocity.
         * @method translate
         * @param {body} body
         * @param {vector} translation
         */
        Body.translate = function(body, translation) {
            Body.setPosition(body, Vector.add(body.position, translation));
        };

        /**
         * Rotates a body by a given angle relative to its current angle, without imparting any angular velocity.
         * @method rotate
         * @param {body} body
         * @param {number} rotation
         * @param {vector} [point]
         */
        Body.rotate = function(body, rotation, point) {
            if (!point) {
                Body.setAngle(body, body.angle + rotation);
            } else {
                var cos = Math.cos(rotation),
                    sin = Math.sin(rotation),
                    dx = body.position.x - point.x,
                    dy = body.position.y - point.y;

                Body.setPosition(body, {
                    x: point.x + (dx * cos - dy * sin),
                    y: point.y + (dx * sin + dy * cos)
                });

                Body.setAngle(body, body.angle + rotation);
            }
        };

        /**
         * Scales the body, including updating physical properties (mass, area, axes, inertia), from a world-space point (default is body centre).
         * @method scale
         * @param {body} body
         * @param {number} scaleX
         * @param {number} scaleY
         * @param {vector} [point]
         */
        Body.scale = function(body, scaleX, scaleY, point) {
            for (var i = 0; i < body.parts.length; i++) {
                var part = body.parts[i];

                // scale vertices
                Vertices.scale(part.vertices, scaleX, scaleY, body.position);

                // update properties
                part.axes = Axes.fromVertices(part.vertices);

                if (!body.isStatic) {
                    part.area = Vertices.area(part.vertices);
                    Body.setMass(part, body.density * part.area);

                    // update inertia (requires vertices to be at origin)
                    Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                    Body.setInertia(part, Vertices.inertia(part.vertices, part.mass));
                    Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
                }

                // update bounds
                Bounds.update(part.bounds, part.vertices, body.velocity);
            }

            // handle circles
            if (body.circleRadius) {
                if (scaleX === scaleY) {
                    body.circleRadius *= scaleX;
                } else {
                    // body is no longer a circle
                    body.circleRadius = null;
                }
            }

            if (!body.isStatic) {
                var total = _totalProperties(body);
                body.area = total.area;
                Body.setMass(body, total.mass);
                Body.setInertia(body, total.inertia);
            }
        };

        /**
         * Performs a simulation step for the given `body`, including updating position and angle using Verlet integration.
         * @method update
         * @param {body} body
         * @param {number} deltaTime
         * @param {number} timeScale
         * @param {number} correction
         */
        Body.update = function(body, deltaTime, timeScale, correction) {
            var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);

            // from the previous step
            var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
                velocityPrevX = body.position.x - body.positionPrev.x,
                velocityPrevY = body.position.y - body.positionPrev.y;

            // update velocity with Verlet integration
            body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
            body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;

            body.positionPrev.x = body.position.x;
            body.positionPrev.y = body.position.y;
            body.position.x += body.velocity.x;
            body.position.y += body.velocity.y;

            // update angular velocity with Verlet integration
            body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
            body.anglePrev = body.angle;
            body.angle += body.angularVelocity;

            // track speed and acceleration
            body.speed = Vector.magnitude(body.velocity);
            body.angularSpeed = Math.abs(body.angularVelocity);

            // transform the body geometry
            for (var i = 0; i < body.parts.length; i++) {
                var part = body.parts[i];

                Vertices.translate(part.vertices, body.velocity);

                if (i > 0) {
                    part.position.x += body.velocity.x;
                    part.position.y += body.velocity.y;
                }

                if (body.angularVelocity !== 0) {
                    Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                    Axes.rotate(part.axes, body.angularVelocity);
                    if (i > 0) {
                        Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                    }
                }

                Bounds.update(part.bounds, part.vertices, body.velocity);
            }
        };

        /**
         * Applies a force to a body from a given world-space position, including resulting torque.
         * @method applyForce
         * @param {body} body
         * @param {vector} position
         * @param {vector} force
         */
        Body.applyForce = function(body, position, force) {
            body.force.x += force.x;
            body.force.y += force.y;
            var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
            body.torque += offset.x * force.y - offset.y * force.x;
        };

        /**
         * Returns the sums of the properties of all compound parts of the parent body.
         * @method _totalProperties
         * @private
         * @param {body} body
         * @return {}
         */
        var _totalProperties = function(body) {
            // from equations at:
            // https://ecourses.ou.edu/cgi-bin/ebook.cgi?doc=&topic=st&chap_sec=07.2&page=theory
            // http://output.to/sideway/default.asp?qno=121100087

            var properties = {
                mass: 0,
                area: 0,
                inertia: 0,
                centre: { x: 0, y: 0 }
            };

            // sum the properties of all compound parts of the parent body
            for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
                var part = body.parts[i];
                properties.mass += part.mass;
                properties.area += part.area;
                properties.inertia += part.inertia;
                properties.centre = Vector.add(properties.centre,
                    Vector.mult(part.position, part.mass !== Infinity ? part.mass : 1));
            }

            properties.centre = Vector.div(properties.centre,
                properties.mass !== Infinity ? properties.mass : body.parts.length);

            return properties;
        };



    module.exports = Body;
});