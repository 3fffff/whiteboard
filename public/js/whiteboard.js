var boardTools= {
    lineWidth: 1,
    marker: {
        size: 6,
        opacity: 0.3
    },
    eraser: {
        size: 10,
        opacity:1
    },
    text: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontStyle: 'normal'
    },
    mouse: {
        mouseDown: false,
        pos: {
            initial: {x: 0, y: 0},
            final: {x: 0, y: 0}
        },
        offsetFinish : {x : 0, y : 0},
        offsetInitial : {x : 0, y : 0},
        text:{top:0,left:0}
    },
    canvas: document.getElementById("canvas"),
    ctx: document.getElementById("canvas").getContext('2d'),
    offset:{x:0,y:0},
    tool: 'pencil',
    draw:[],
    last:{},
    dragStart:null,
    dragged:false,
    scale:1.0,
    posScaleI:{sx:0,sy:0}
}
class board  {
    static trackMouse(e) {
        boardTools.offset.x  = (e.sx-boardTools.posScaleI.sx)*boardTools.scale
        boardTools.offset.y  = (e.sy-boardTools.posScaleI.sy)*boardTools.scale
        boardTools.mouse.offsetInitial.x=boardTools.offset.x
        boardTools.mouse.offsetInitial.y=boardTools.offset.y
    }

    static transform(ctx) {

        ctx.clearRect(0, 0, boardTools.canvas.clientWidth, boardTools.canvas.clientHeight);

        ctx.save();

        ctx.translate(boardTools.canvas.clientWidth/2+boardTools.offset.x, boardTools.canvas.clientHeight/2+boardTools.offset.y);
        ctx.scale(boardTools.scale, boardTools.scale);
        for(var i=0;i<boardTools.draw.length;i++)
            rtSocket.drawFromSocket(boardTools.draw[i])
        ctx.restore();
    }

    static MousePosScale(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var sx = (x-boardTools.canvas.clientWidth/2)/boardTools.scale;
        var sy = (y-boardTools.canvas.clientHeight/2)/boardTools.scale;
        return {
            sx : sx,
            sy:sy
        };
    }
    static shapeSVG(stroke){
        var xmlns = "http://www.w3.org/2000/svg";
        var svg= document.createElementNS(xmlns, "svg");
        svg.id="dop"
        svg.style.width=document.body.clientWidth
        svg.style.height=document.body.clientHeight
        svg.innerHTML+= "  <"+stroke + " style=\"fill:rgba(152,255,226,0.5);stroke-width:3;stroke:#00efff\" />\n"
        document.body.appendChild(svg)
    }
    static pencil (ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    static marker (context, x1, y1, x2, y2, size, color) {
        context.globalAlpha = boardTools.marker.opacity;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();

        context.globalAlpha = 1;
        context.lineWidth = size;
    }
    static text (context, text, x, y) {
        context.fillText(text, x, y);
    }

    static loadImage(data){
        document.getElementById("LoadedImage").style.display="block"
        var preload=document.getElementById("preloadImg")
        var drop=document.getElementsByClassName("drop")[0]
        var reader = new FileReader();
        reader.onload = function(evt){
            var pic = new Image();
            pic.src    = evt.target.result;
            pic.onload = function() {
                if(this.width>document.body.clientWidth/2 || this.height>document.body.clientHeight/2) {
                    var resx=this.width*0.3
                    var resy=this.height*0.3
                    var x=(document.body.clientWidth-resx)/2
                    var y=(document.body.clientHeight-resy)/2
                    preload.style.height=resy+"px"
                    preload.style.width=resx+"px"
                    drop.style.left=x+"px"
                    drop.style.top=y+"px"
                }
                else {
                    var x=(document.body.clientWidth-this.width)/2
                    var y=(document.body.clientHeight-this.height)/2
                    preload.style.height = this.height + "px"
                    preload.style.width = this.width + "px"
                    drop.style.left = x + "px"
                    drop.style.top = y + "px"
                }
            }
            preload.src=evt.target.result
        };
        if(data)
            reader.readAsDataURL(data);
    }

    static  drawImageRot (ctx,img,x,y,width,height,deg){
        var rad = deg * Math.PI / 180;
        ctx.translate(((x)+ width / 2), ((y) + height / 2));
        ctx.rotate(rad);
        ctx.drawImage(img,(((width / 2)) * (-1)), (((height / 2))  * (-1)), (width), (height));
        ctx.rotate(rad * (-1));
        ctx.translate(((x)+width / 2) * (-1), ((y)+height / 2) * (-1));
    }

    static rect (ctx, x, y, w, h) {
    ctx.strokeRect(x, y, w, h);
}

static  circle (ctx, x1, y1, x2, y2) {
    var x = (x2 + x1) / 2;
    var y = (y2 + y1) / 2;
    var radius = Math.max(
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
    ) / 2;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
}

static  ellipse (ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x+w/2, y+h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, 2 * Math.PI);
    ctx.stroke();
}

static  line (ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
static arrow (ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    var dx = x2 - x1;
    var dy = y2 - y1;
    var angle = Math.atan2(dy, dx);
    var headlen = 10;
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));

    ctx.stroke();
}
static eraser(ctx){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.eraser.size, 0, 2 * Math.PI);
    ctx.fill();
}

static changeTool (t) {
    boardTools.dragged=false
    removeBlock("txtText")
    boardTools.canvas.classList.remove("grab")
    boardTools.canvas.style.cursor="crosshair"
    document.getElementById("textControl").style.visibility="hidden"
    switch(t) {
        case 'pencil':
            boardTools.ctx.lineWidth = boardTools.lineWidth;
            document.getElementById("size").value=boardTools.lineWidth;
            boardTools.last={
                type: 'pencil',
                data: {}
            }
            break
        case 'marker':
            boardTools.ctx.lineWidth = boardTools.marker.size;
            document.getElementById("size").value=parseInt(boardTools.marker.size);
            boardTools.last={
                type: 'marker',
                data: {}}
            break
        case'eraser':
            boardTools.ctx.lineWidth = boardTools.eraser.lineWidth;
            document.getElementById("size").value=parseInt(boardTools.eraser.size) / 10;
            break

        case 'text':
            document.getElementById("textControl").style.visibility="visible";

            break
    }
    boardTools.tool = t;
}

static changeColor (color) {
    boardTools.ctx.strokeStyle = color;
    boardTools.ctx.fillStyle = color;
    if(document.getElementById("txtText")!==null)
        document.getElementById("txtText").style.color=color
}

static changeSize (size) {
    switch(boardTools.tool) {
        case'marker':
            boardTools.marker.size = size * 5;
            boardTools.lineWidth = boardTools.marker.size;
            break
        case'eraser':
            boardTools.eraser.size = size * 10;
            break
        default:
            boardTools.ctx.lineWidth = size;
            boardTools.lineWidth = size;
            break
    }
}
}

function drawStart (e) {
    removeBlockClass("fadeInLeft")
    boardTools.mouse.mouseDown = true;
    boardTools.mouse.pos.initial.x = e.clientX
    boardTools.mouse.pos.initial.y = e.clientY
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    boardTools.posScaleI=board.MousePosScale(boardTools.canvas,e)
    console.log(boardTools.posScaleI)
    console.log(boardTools.offset)
    if(!boardTools.dragged) {
        switch (boardTools.tool) {
            case 'text':
                if(document.getElementById("txtText")!==null)
                    textInsert()
                boardTools.mouse.mouseDown = false;
                removeBlock("txtText")
                var textarea = document.createElement("textarea");
                textarea.id = "txtText"
                textarea.placeholder = "введите текст"
                textarea.wrap="off"
                document.body.appendChild(textarea)
                var txtT=document.getElementById("txtText")
                var text=document.getElementById("textControl")
                txtT.style.left = boardTools.mouse.pos.initial.x + "px"
                txtT.style.top = boardTools.mouse.pos.initial.y + "px"
                text.style.marginLeft = boardTools.mouse.pos.initial.x + "px"
                text.style.marginTop = boardTools.mouse.pos.initial.y + "px"
                txtT.style.fontWeight="normal"
                txtT.style.fontStyle=boardTools.text.fontStyle
                txtT.style.fontSize=boardTools.text.fontSize
                txtT.style.fontFamily=boardTools.text.fontFamily
                txtT.style.color=boardTools.ctx.strokeStyle
                var x = boardTools.canvas.clientWidth - boardTools.mouse.pos.initial.x-15
                var y = boardTools.canvas.clientHeight - boardTools.mouse.pos.initial.y-15
                txtT.style.width = x + "px"
                txtT.style.height = y + "px"
                boardTools.mouse.text.top = boardTools.mouse.pos.initial.y;
                boardTools.mouse.text.left = boardTools.mouse.pos.initial.x;
                txtT.addEventListener("click",textInsert)
                setTimeout(function(){txtT.focus()},50)
                break
            case 'pencil':
                boardTools.last={
                    type: 'pencil',
                    data: {
                        strokeStyle: boardTools.ctx.strokeStyle,
                        lineWidth: boardTools.lineWidth,
                        points: [{
                            x: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                            y: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale
                        }]
                    }
                }
                break
            case 'marker':
                boardTools.last = {
                    type: 'marker',
                    data: {
                        strokeStyle: boardTools.ctx.strokeStyle,
                        size: boardTools.marker.size,
                        lineWidth: boardTools.ctx.size,
                        points: [{
                            x: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                            y: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale
                        }]
                    }
                }
                break
            case 'eraser':
                boardTools.last = {
                    type: 'eraser',
                    data: {
                        size: boardTools.eraser.size,
                        points: [{
                            x: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                            y: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale
                        }]
                    }
                }
                break
        }
    }
    else{
        boardTools.canvas.classList.remove("grab")
        boardTools.canvas.classList.add("grabbing")
    }
}

function drawEnd(e) {
    boardTools.mouse.mouseDown = false;
    var posScale=board.MousePosScale(boardTools.canvas,e)
    if(!boardTools.dragged) {
        switch (boardTools.tool) {
            case 'line':
                removeBlock("dop")
                board.line(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
                boardTools.last = {
                    type: 'line',
                    data: {
                        lineWidth: boardTools.lineWidth,
                        strokeStyle: boardTools.ctx.strokeStyle,
                        x1: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                        y1: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale,
                        x2: posScale.sx-(boardTools.offset.x)/boardTools.scale,
                        y2: posScale.sy-(boardTools.offset.y)/boardTools.scale
                    }
                }
                break
            case'rectangle':
                removeBlock("dop")
                board.rect(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x, boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y);
                boardTools.last = {
                    type: 'rectangle',
                    data: {
                        lineWidth: boardTools.lineWidth,
                        strokeStyle: boardTools.ctx.strokeStyle,
                        x: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                        y: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale,
                        w: posScale.sx - boardTools.posScaleI.sx,
                        h: posScale.sy - boardTools.posScaleI.sy
                    }
                }
                break
            case 'circle':
                removeBlock("dop")
                board.circle(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
                boardTools.last = {
                    type: 'circle',
                    data: {
                        strokeStyle: boardTools.ctx.strokeStyle,
                        lineWidth: boardTools.lineWidth,
                        x1: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                        y1: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale,
                        x2: posScale.sx-(boardTools.offset.x)/boardTools.scale,
                        y2: posScale.sy-(boardTools.offset.y)/boardTools.scale
                    }
                }
                break
            case 'ellipse':
                removeBlock("dop")
                board.ellipse(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x, boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y);
                boardTools.last = {
                    type: 'ellipse',
                    data: {
                        strokeStyle: boardTools.ctx.strokeStyle,
                        lineWidth: boardTools.lineWidth,
                        x: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                        y: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale,
                        w: posScale.sx - boardTools.posScaleI.sx,
                        h: posScale.sy - boardTools.posScaleI.sy
                    }
                }
                break
            case 'arrow':
                removeBlock("dop")
                board.arrow(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
                boardTools.last = {
                    type: 'arrow',
                    data: {
                        lineWidth: boardTools.lineWidth,
                        strokeStyle: boardTools.strokeStyle,
                        x1: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                        y1: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale,
                        x2: posScale.sx-(boardTools.offset.x)/boardTools.scale,
                        y2: posScale.sy-(boardTools.offset.y)/boardTools.scale
                    }
                }
                break
        }
        console.log("отправка")
        var result={
            boardData: boardTools.last,
            room: tools.roomname,
            from: tools.username,
        }
        tools.socket.emit('drawing', result);
            tools.socket.emit('recover', {
                boardData: {
                    type: "recoverImage",
                    data: {
                        src: boardTools.canvas.toDataURL(),
                        width:boardTools.canvas.clientWidth,
                        height:boardTools.canvas.clientHeight
                    }
                },
                room: tools.roomname,
                from: tools.username
            });
        boardTools.draw.push(result)
    }
    else {
        boardTools.mouse.offsetFinish.x = boardTools.mouse.offsetInitial.x
        boardTools.mouse.offsetFinish.y = boardTools.mouse.offsetInitial.y
        boardTools.canvas.classList.remove("grabbing")
        boardTools.canvas.classList.add("grab")
    }
}
function drawRealT (e) {
    boardTools.mouse.pos.final.x = e.clientX;
    boardTools.mouse.pos.final.y = e.clientY;
    var posScale=board.MousePosScale(boardTools.canvas,e)
    if (boardTools.mouse.mouseDown) {
        if (boardTools.dragged) {
            var er={"clientX":e.clientX+(boardTools.mouse.offsetFinish.x),"clientY":e.clientY+(boardTools.mouse.offsetFinish.y)}
            var posScaleDrag=board.MousePosScale(boardTools.canvas,er)
            board.trackMouse(posScaleDrag)
            board.transform(boardTools.ctx)
        }
        else {
            switch (boardTools.tool) {
                case 'pencil':
                    board.pencil(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
                    boardTools.last.data.points.push({
                        x: posScale.sx-(boardTools.offset.x)/boardTools.scale,
                        y: posScale.sy-(boardTools.offset.y)/boardTools.scale
                    });
                    boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                    boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                    break
                case 'marker':
                    board.marker(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.ctx.size, boardTools.ctx.fillStyle);
                    boardTools.last.data.points.push({
                        x: posScale.sx-(boardTools.mouse.offsetInitial.x)/boardTools.scale,
                        y: posScale.sy-(boardTools.mouse.offsetInitial.y)/boardTools.scale
                    });
                    boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                    boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                    break
                case 'rectangle':
                    removeBlock("dop")
                    var x = boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x
                    var y = boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
                    if (x > 0 && y > 0) {
                        board.shapeSVG("rect x=" + boardTools.mouse.pos.initial.x + " y=" + boardTools.mouse.pos.initial.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
                    }
                    else if (x < 0 && y < 0) {
                        board.shapeSVG("rect x=" + boardTools.mouse.pos.final.x + " y=" + boardTools.mouse.pos.final.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
                    }
                    else if (x > 0 && y < 0) {
                        board.shapeSVG("rect x=" + boardTools.mouse.pos.initial.x + " y=" + boardTools.mouse.pos.final.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
                    }
                    else if (x < 0 && y > 0) {
                        board.shapeSVG("rect x=" + boardTools.mouse.pos.final.x + " y=" + boardTools.mouse.pos.initial.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
                    }
                    break
                case 'ellipse':
                    removeBlock("dop")
                    var w = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
                    var h = (boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y) / 2
                    if (w > 0 && h > 0) {
                        var x = boardTools.mouse.pos.initial.x + w
                        var y = boardTools.mouse.pos.initial.y + h
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    else if (w < 0 && h < 0) {
                       var x = boardTools.mouse.pos.final.x + Math.abs(w)
                      var  y = boardTools.mouse.pos.final.y + Math.abs(h)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    else if (w > 0 && h < 0) {
                      var  x = boardTools.mouse.pos.initial.x + Math.abs(w)
                      var  y = boardTools.mouse.pos.final.y + Math.abs(h)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    else if (w < 0 && h > 0) {
                      var  x = boardTools.mouse.pos.final.x + Math.abs(w)
                      var  y = boardTools.mouse.pos.initial.y + Math.abs(h)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    break
                case "circle":
                    removeBlock("dop")
                    var rx = Math.abs((boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2)
                    var ry = Math.abs((boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y) / 2)
                    var r=Math.max(rx,ry)
                    var xp = boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x
                    var yp = boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
                    if (xp > 0 && yp > 0) {
                        var x = boardTools.mouse.pos.initial.x + r
                        var y = boardTools.mouse.pos.initial.y + r
                        board.shapeSVG("circle cx=" + x + " cy=" + y + " r=" + Math.abs(r))
                    }
                    else if (xp < 0 && yp < 0) {
                        var x = boardTools.mouse.pos.final.x + r
                        var y = boardTools.mouse.pos.final.y + r
                        board.shapeSVG("circle cx=" + x + " cy=" + y + " r=" + Math.abs(r))
                    }
                    else if (xp > 0 && yp < 0) {
                        var x = boardTools.mouse.pos.initial.x + Math.abs(r)
                        var y = boardTools.mouse.pos.final.y + Math.abs(r)
                        board.shapeSVG("circle cx=" + x + " cy=" + y + " r=" + Math.abs(r))
                    }
                    else if (xp < 0 && yp > 0) {
                        var x = boardTools.mouse.pos.final.x + Math.abs(r)
                        var y = boardTools.mouse.pos.initial.y + Math.abs(r)
                        board.shapeSVG("circle cx=" + x + " cy=" + y + " r=" + Math.abs(r))
                    }
                    break
                case 'arrow':
                    removeBlock("dop")
                    board.shapeSVG("line x1=" + boardTools.mouse.pos.initial.x + " y1=" + boardTools.mouse.pos.initial.y + " x2=" + boardTools.mouse.pos.final.x + " y2=" + boardTools.mouse.pos.final.y)
                    break
                case 'line':
                    removeBlock("dop")
                    board.shapeSVG("line x1=" + boardTools.mouse.pos.initial.x + " y1=" + boardTools.mouse.pos.initial.y + " x2=" + boardTools.mouse.pos.final.x + " y2=" + boardTools.mouse.pos.final.y)
                    break
                case 'eraser':
                    board.eraser(boardTools.ctx);
                    boardTools.last.data.points.push({
                        x: posScale.sx-(boardTools.mouse.offsetInitial.x)/boardTools.scale,
                        y: posScale.sy-(boardTools.mouse.offsetInitial.y)/boardTools.scale
                    });
                    boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                    boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                    break
            }
        }
    }
}
function removeBlock(del)
{
    if(document.getElementById(del)!==null)
        document.getElementById(del).parentNode.removeChild(document.getElementById(del))
}
function removeBlockClass(del)
{
    for(var i=0;i<document.getElementsByClassName(del).length;i++) {
        if (document.getElementsByClassName(del)[i] !== null)
            document.getElementsByClassName(del)[i].className="toolbox fadeInLeft"
    }
}

function textInsert() {
    var txt=document.getElementById("txtText")
    if(txt.value!=="") {
        var r=txt.value.toString().split("\n")
        boardTools.ctx.font = boardTools.text.fontStyle + " " + boardTools.text.fontSize + "px " + boardTools.text.fontFamily;
        console.log(boardTools.ctx.font)
        for(let i=0;i<r.length;i++)
            board.text(boardTools.ctx, r[i], boardTools.mouse.text.left, boardTools.mouse.text.top + parseInt(boardTools.text.fontSize)+i*parseInt(boardTools.text.fontSize));
        var e = {clientX: boardTools.mouse.text.left, clientY: boardTools.mouse.text.top + parseInt(boardTools.text.fontSize)}
        var er = board.MousePosScale(boardTools.canvas, e)
        var res = {
            boardData: {
                type: 'text',
                data: {
                    size:boardTools.text.fontSize,
                    font: boardTools.ctx.font,
                    strokeStyle: boardTools.ctx.fillStyle,
                    text: txt.value,
                    x: er.sx - (boardTools.offset.x / boardTools.scale),
                    y: er.sy - (boardTools.offset.y / boardTools.scale)
                }
            },
            room: tools.roomname,
            from: tools.username
        }
        boardTools.draw.push(res)
        tools.socket.emit('drawing', res);
    }
    removeBlock("txtText")
}
var active=false, center={x:0,y:0}, rotation=0, startAngle=0,moveImg=false,posMove={x:0,y:0},changeS={x:0,y:0},resizeImg=false,angle=0,chanL=0,partX,partY

function start(e) {
    var ref = document.getElementsByClassName("drop")[0].getBoundingClientRect()
    center = {
        x: ref.left + (ref.width / 2),
        y: ref.top + (ref.height / 2)
    };
    var x = e.clientX - center.x;
    var y = e.clientY - center.y;
    startAngle = (180 / Math.PI) * Math.atan2(y, x);
    active = true;
}

function rotate(e) {
    var x = e.clientX - center.x;
    var y = e.clientY - center.y;
    if (active) {
        var d = (180 / Math.PI) * Math.atan2(y, x);
        rotation = d - startAngle;
        moveImg = false
        resizeImg = false
        var r = angle + rotation
        document.getElementById("rotation").style.webkitTransform = "rotate(" + r + "deg)";
    }
}

function stop() {
    if(active)
        angle += rotation;
    moveImg=false
    active=false
    resizeImg=false
};

function StartSize(){
    var refDrop = document.getElementsByClassName("drop")[0].getBoundingClientRect()
    var ref = this.getBoundingClientRect()
    partX=ref.x-refDrop.x
    partY=ref.y-refDrop.y
    changeS={
        x: ref.x,
        y: ref.y
    }
    resizeImg=true
}

function sizeChange(evt){
    var k=10
    var x=evt.clientX-changeS.x
    var x1=x-chanL
    var preload=document.getElementById("preloadImg")
    var prevw=preload.style.width
    prevw=parseFloat(prevw.substr(0,prevw.length-2))
    var prevh=preload.style.height
    prevh=parseFloat(prevh.substr(0,prevh.length-2))
    var scale=parseFloat(prevh/prevw)
    if(partX<0 && x1>0) {
        prevh-=k*scale
        prevw-=k
    }
    else if(partX<0 && x1<0){
        prevh+=k*scale
        prevw+=k
    }
    else if(partX>0 && x1<0){
        prevh-=k*scale
        prevw-=k
    }
    else if(partX>0 && x1>0){
        prevh+=k*scale
        prevw+=k
    }
    if(resizeImg) {
        active=false
        moveImg=false
        chanL=x
        preload.style.width=prevw+"px"
        preload.style.height=prevh+"px"
    }
}

function EndSize(){
    moveImg=false
    active=false
    resizeImg=false
}
function moveImgStart(e){
    var ref = document.getElementsByClassName("drop")[0].getBoundingClientRect()
    posMove = {
        x: e.clientX-ref.left,
        y: e.clientY-ref.top
    };
    console.log("начало")
    console.log(center)
    moveImg=true
}
function moveImgF(event){
    var x = event.clientX - posMove.x;
    var y = event.clientY - posMove.y;

    if(moveImg) {
        active=false
        resizeImg=false
        document.getElementsByClassName("drop")[0].style.left = x + "px"
        document.getElementsByClassName("drop")[0].style.top = y + "px"
    }
}
function moveImgStop(){
    moveImg=false
    active=false
    resizeImg=false
}
function Scroll(evt){
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;

    if (boardTools.scale<10.1 &&delta>0)
        boardTools.scale+=0.1
    else if(boardTools.scale>0.2 &&delta<0)
        boardTools.scale-=0.1
    board.transform(boardTools.ctx);
    return evt.preventDefault() && false;
};

for(var i=0;i<document.getElementsByClassName("tool").length;i++) {
    document.getElementsByClassName("tool")[i].addEventListener("click",function () {
        board.changeTool(this.getAttribute("id"));
        if(document.getElementsByClassName("boardBtnSelected")[0]!==undefined)
            document.getElementsByClassName("boardBtnSelected")[0].classList.remove("boardBtnSelected")
        var r = document.getElementsByClassName("visible")[0]
        if(r!==undefined)
            r.classList.remove("visible")
        this.classList.add('boardBtnSelected');
    });
}
for(var i=0;i<document.getElementsByClassName("dropRight").length;i++) {
    document.getElementsByClassName("dropRight")[i].addEventListener('click',function () {
        var r=document.getElementsByClassName("visible")[0]
        if(r!==undefined)
            r.className = "toolbox fadeInLeft"
        this.parentNode.childNodes[3].className="toolbox fadeInLeft visible"
    });
}
for(var i=0;i<document.getElementsByClassName("predefined__color").length;i++) {
    document.getElementsByClassName("predefined__color")[i].addEventListener("click",function () {
        var color = this.style.backgroundColor;
        var colorPick = document.getElementsByClassName("picked__color")
        colorPick[0].style = "background-color:" + color
        board.changeColor(color);
        var r = document.getElementsByClassName("visible")[0].classList
        r.value = "toolbox fadeInLeft"
    })
}

document.getElementById("size").addEventListener("change",function () {
    if(this.value>0 && this.value<6)
        board.changeSize(this.value);
});

for(var i=0;i<document.getElementsByClassName("txtFontStyle").length;i++) {
    document.getElementsByClassName("txtFontStyle")[i].addEventListener("click",function () {
        boardTools.text.fontStyle = this.getAttribute("data-value");
        document.getElementsByClassName("boardBtnSelected")[0].classList.value = "tools__item tool boardBtn"
        console.log(document.getElementsByClassName("boardBtnSelected")[0])
        this.classList.add('boardBtnSelected');
    });
}

document.getElementById("txtFontSize").addEventListener("change",function () {
    if(this.value>9 && this.value<73)
        boardTools.text.fontSize = this.value;
    document.getElementById("txtText").style.fontSize=this.value
});

document.getElementById('ImageLoad').addEventListener('change', function(e){
    var files = e.target.files[0];
    board.loadImage(files)
}, false);
document.getElementById('ImageLoad').addEventListener('click', function(e){
    document.getElementById('ImageLoad').value = "";
}, false);

document.getElementById("ImgLoadCanvas").addEventListener("click",function() {
    var x=document.getElementsByClassName("drop")[0].style.left
    x=parseInt(x.substr(0,x.length-2))
    var y=document.getElementsByClassName("drop")[0].style.top
    var d=document.getElementById("rotation").style.transform
    y=parseInt(y.substr(0,y.length-2))
    var de=d.split("(")
    var deg=parseFloat(de[1].substr(0,de[1].length-4))
    var h=document.getElementById("preloadImg").style.height
    h=parseInt(h.substr(0,h.length-2))
    var w=document.getElementById("preloadImg").style.width
    w=parseInt(w.substr(0,w.length-2))
    var image=new Image()
    image.onload=function() {
        var e = {clientX: x, clientY:y}
        var er = board.MousePosScale(boardTools.canvas, e)
        board.drawImageRot(boardTools.ctx,image,x,y,w,h,deg)
        let res={
            boardData: {
                type:"image",
                data: {
                    src: image,
                     x: er.sx - (boardTools.offset.x / boardTools.scale),
                    y: er.sy - (boardTools.offset.y / boardTools.scale),
                    w: w/boardTools.scale, h: h/boardTools.scale, deg:deg
                }
            },
            room: tools.roomname,
            from: tools.username
        }
        tools.socket.emit('drawing', res);
        boardTools.draw.push(res)
    }

    image.src=document.getElementById("preloadImg").src
    document.getElementById("rotation").style.transform="rotate("+0+"deg)"
    angle=0
    document.getElementById("LoadedImage").style.display="none"
    document.getElementById("preloadImg").src=""
    boardTools.tool = "pencil";
})

document.getElementById("CancelCanvas").addEventListener("click",function(){
    document.getElementById("preloadImg").src=""
    document.getElementById("LoadedImage").style.display="none"
    document.getElementById("rotation").style.transform="rotate("+0+"deg)"
    angle=0
    boardTools.tool = "pencil";
})
document.getElementById("saveImage").addEventListener("click",function(){
    document.getElementById("ImgSave").href = boardTools.canvas.toDataURL();
    document.getElementById("ImgSave").download = "image.png";
    boardTools.tool = "pencil";
})

document.getElementsByClassName("smiley")[0].addEventListener("click",function(){
    if(document.getElementsByClassName("tooltip")[0].style.visibility==="hidden")
        document.getElementsByClassName("tooltip")[0].style.visibility="visible"
    else document.getElementsByClassName("tooltip")[0].style.visibility="hidden"
})
for(var i=0;i<document.getElementsByClassName("ec").length;i++) {
    document.getElementsByClassName("ec")[i].addEventListener("click",function(){
        document.getElementsByClassName("text-box")[0].innerHTML+=this.outerHTML
        document.getElementsByClassName("tooltip")[0].style.visibility="hidden"
    })
}
document.getElementById("drag").addEventListener("click",function(){
    if(!boardTools.dragged) {
        boardTools.dragged = true
        boardTools.canvas.classList.add("grab")
    }
    else {
        boardTools.canvas.classList.remove("grab")
        boardTools.dragged=false
        boardTools.canvas.style.cursor="crosshair"
    }
})

for(var i=0;i<document.getElementsByClassName("grip").length;i++) {
    document.getElementsByClassName("grip")[i].addEventListener('mousedown', StartSize, false);
    document.getElementsByClassName("grip")[i].addEventListener('mousemove', sizeChange, false);
    document.getElementsByClassName("grip")[i].addEventListener('mouseup', EndSize, false);
}
document.getElementById("canvas").addEventListener('mousedown',drawStart)
document.getElementById("canvas").addEventListener('touchstart',drawStart)
document.getElementById("canvas").addEventListener('mouseup', drawEnd);
document.getElementById("canvas").addEventListener('touchend', drawEnd);
document.getElementById("canvas").addEventListener('mousemove',drawRealT,false);
document.getElementById("canvas").addEventListener('touchmove',drawRealT,false);
document.getElementById("canvas").addEventListener('DOMMouseScroll',Scroll,false);
document.getElementById("canvas").addEventListener('mousewheel',Scroll,false);
document.getElementsByClassName("drop")[0].addEventListener("mousedown",moveImgStart,false)
document.getElementsByClassName("drop")[0].addEventListener("mousemove",moveImgF,false)
document.getElementsByClassName("drop")[0].addEventListener("mouseup",moveImgStop,false)
document.getElementById("LoadedImage").addEventListener("mouseup",EndSize,false)
document.getElementById("LoadedImage").addEventListener("mousemove",sizeChange,false)
document.getElementsByClassName("drop")[0].addEventListener('mouseup', EndSize, false);
document.getElementsByClassName("rotator")[0].addEventListener("mousedown",start,false)
document.getElementsByClassName("rotator")[0].addEventListener("mouseup",stop,false)
document.getElementsByClassName("rotator")[0].addEventListener("mousemove",rotate,false)
document.getElementById("LoadedImage").addEventListener("mousemove",rotate,false)
document.getElementById("LoadedImage").addEventListener("mouseup",stop,false)
document.getElementById("LoadedImage").addEventListener("click",stop,false)