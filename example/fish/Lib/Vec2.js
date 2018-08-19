class Vec2 {
    constructor(x, y) {
        if(x===undefined||y===undefined){
            console.error('Vec2 construct with error params');
        }
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vec2(vec.x + this.x, vec.y + this.y);
    }

    subtract(vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    scale(n) {
        return new Vec2(this.x * n, this.y * n);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(vec) {
        return (this.x * vec.x + this.y * vec.y);
    }

    cross(vec) {
        return (this.x * vec.y - this.y * vec.x);
    }

    rotate(center, angle) {
        let x1;
        let y1;

        const x = this.x - center.x;
        const y = this.y - center.y;

        x1 = x * Math.cos(angle) - y * Math.sin(angle);
        y1 = x * Math.sin(angle) + y * Math.cos(angle);

        x1 += center.x;
        y1 += center.y;

        return new Vec2(x1, y1);
    }

    normalize() {

        let len = this.length();
        if (len > 0) {
            len = 1 / len;
        }
        return new Vec2(this.x * len, this.y * len);
    }

    distance(vec) {
        const x = this.x - vec.x;
        const y = this.y - vec.y;
        return Math.sqrt(x * x + y * y);
    }
}

export default Vec2;