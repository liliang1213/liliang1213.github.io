import Engine from '../EngineCore/Core'
function drawLine(start,end){
    var context=Engine.mContext;
    context.strokeStyle = 'purple';
    context.beginPath();
    context.moveTo(start.x,start.y);
    context.lineTo(end.x, end.y);

    context.closePath();
    context.stroke();
}

export default {
    drawLine:drawLine
}