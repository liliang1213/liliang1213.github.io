function Arrow () {
  this.x = 0;
  this.y = 0;
  this.color = "#ffff00";
  this.rotation = 0;
}

Arrow.prototype.draw = function (context) {
  context.save();
  context.translate(this.x, this.y);
  context.rotate(this.rotation);
  
  context.lineWidth = 2;
  context.fillStyle = this.color;
  context.beginPath();
  context.moveTo(-15, 0);
  context.lineTo(-100, 100);
  context.lineTo(50, 0);
  context.lineTo(-100, -100);
  context.lineTo(-15, 0);
  context.closePath();
  context.fill();
  context.stroke();
    context.strokeStyle = '#f00';
    context.beginPath();
    context.moveTo(50, 0);
    context.lineTo(-15, 0);
    context.stroke();
    context.closePath();
  context.restore();
};
