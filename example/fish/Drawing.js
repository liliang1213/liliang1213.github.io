class Drawing{
    constructor(opts){
        this.mWidth = opts.width;
        this.mHeight = opts.height;

        this.mCanvas = document.getElementById('canvas');
        this.context = this.mCanvas.getContext('2d');
    }

    draw(mAllObjects){
        this.context.clearRect(0, 0, this.mWidth, this.mHeight);
        let i=mAllObjects.length;
        while(i--){
            if(mAllObjects[i].collided){
                this.context.strokeStyle = 'red';
            }else{
                this.context.strokeStyle = 'blue';
            }
            if(mAllObjects[i].mType=='Circle'){
                this.drawCircle(mAllObjects[i]);
            }else if(mAllObjects[i].mType=='Rectangle'){
                this.drawRect(mAllObjects[i]);
            }else if(mAllObjects[i].mType=='Polygon'){
                this.drawPolygon(mAllObjects[i]);
            }
        }
    }

    drawCircle(obj){
        this.context.fillStyle=obj.collided?'red':'yellow';
        this.context.beginPath();
        this.context.arc(obj.mCenter.x, obj.mCenter.y, obj.mRadius, 0, Math.PI * 2, true);
        this.context.moveTo(obj.mStartpoint.x, obj.mStartpoint.y);
        this.context.lineTo(obj.mCenter.x, obj.mCenter.y);
        this.context.fill();
        this.context.closePath();
        this.context.stroke();
    }

    drawRect(obj){
        this.context.save();
        this.context.fillStyle=obj.collided?"red":"green";
        this.context.translate(obj.mVertex[0].x, obj.mVertex[0].y);
        this.context.rotate(obj.mAngle);
        this.context.fillRect(0, 0, obj.mWidth, obj.mHeight);
        this.context.restore();
    }

    drawPolygon(obj){
        this.context.save();
        this.context.fillStyle=obj.collided?'red':'blue';
        this.context.beginPath();
        const vertices=obj.mVertex;
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            if(i==0) {
                this.context.moveTo(obj.mVertex[i].x, obj.mVertex[i].y);
            }
            this.context.lineTo(obj.mVertex[j].x, obj.mVertex[j].y);
        }
        this.context.translate(obj.mVertex[0].x, obj.mVertex[0].y);
        this.context.rotate(obj.mAngle);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    }
}

export default Drawing;