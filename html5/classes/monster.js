function Monster (img) {
    this.x = 0;
    this.y = 0;
    this.img = img;
    this.width=this.img.width;
    this.height=this.img.height;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
}

Monster.prototype.draw = function (context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.scale(this.scaleX, this.scaleY);
    context.translate(-this.x,-this.y);//将画布原点移动
    context.drawImage(this.img,this.x-this.width/2,this.y-this.height/2);
    context.restore();
};
