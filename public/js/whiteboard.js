var boardTools= {
    pencil: {
        lineWidth: 1
    },
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
    shape: {
        lineWidth: 1
    },
    canvas: document.getElementById("canvas"),
    ctx: document.getElementById("canvas").getContext('2d'),
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
         boardTools.offset.x  = (e.sx-boardTools.posScaleI.sx)/boardTools.scale
         boardTools.offset.y  = (e.sy-boardTools.posScaleI.sy)/boardTools.scale
         boardTools.mouse.offsetInitial.x=boardTools.mouse.offsetFinish.x+boardTools.offset.x
         boardTools.mouse.offsetInitial.y=boardTools.mouse.offsetFinish.y+boardTools.offset.y
    }

    static transform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
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
        svg.style.width=document.body.clientWidth-10
        svg.style.height=document.body.clientHeight-10
        svg.innerHTML+= "  <"+stroke + " style=\"fill:rgba(152,255,226,0.5);stroke-width:3;stroke:#00efff\" />\n"
        document.body.appendChild(svg)
    }
    static pencil (context, x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
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
    static  drawImageRot (context,img,x,y,width,height,deg){
        var rad = deg * Math.PI / 180;
        context.translate(boardTools.scale*(boardTools.offset.x+x + width / 2), boardTools.scale*(boardTools.offset.y+y + height / 2));
        context.rotate(rad);
        context.drawImage(img, width / 2 * (-1)*boardTools.scale, height / 2 * (-1)*boardTools.scale, width*boardTools.scale, height*boardTools.scale);
        context.rotate(rad * (-1));
        context.translate((boardTools.offset.x+x + width / 2) * (-1)*boardTools.scale, (boardTools.offset.y+y + height / 2) * (-1)*boardTools.scale);
    }


    static rect (context, x, y, w, h) {
        context.strokeRect(x, y, w, h);
    }

    static  circle (context, x1, y1, x2, y2) {
        var x = (x2 + x1) / 2;
        var y = (y2 + y1) / 2;
        var radius = Math.max(
            Math.abs(x2 - x1),
            Math.abs(y2 - y1)
        ) / 2;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    static  ellipse (context, x, y, w, h) {
        context.beginPath();
        context.ellipse(x+w/2, y+h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, 2 * Math.PI);
        context.stroke();
    }

    static  line (context, x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }
    static arrow (context, x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);

        var dx = x2 - x1;
        var dy = y2 - y1;
        var angle = Math.atan2(dy, dx);
        var headlen = 10;
        context.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(x2, y2);
        context.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));

        context.stroke();
    }
    static eraser(context){
        context.beginPath();
        context.fillStyle = "white";
        context.arc(boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.eraser.size, 0, 2 * Math.PI);
        context.fill();

    }

    static changeTool (t) {
        boardTools.dragged=false
        boardTools.canvas.style.cursor="crosshair"
        removeBlock("txtText")
        document.getElementById("textControl").style.visibility="hidden"
        switch(t) {

            case 'pencil':

                boardTools.ctx.lineWidth = boardTools.pencil.lineWidth;
                document.getElementById("size").value=boardTools.pencil.lineWidth;
                boardTools.last={
                    type: 'pencil',
                    data: []
                }
                break
            case 'marker':
                boardTools.ctx.lineWidth = boardTools.marker.size;
                document.getElementById("size").value=parseInt(boardTools.marker.size) - parseInt(boardTools.marker.defaultSize);
                boardTools.last={
                    type: 'marker',
                    data: []}
                break
            case'eraser':
                boardTools.ctx.lineWidth = boardTools.eraser.lineWidth;
                document.getElementById("size").value=parseInt(boardTools.eraser.size) / 10;
                break

            case 'text':
                document.getElementById("textControl").style.visibility="visible";

                break
            default:
                boardTools.ctx.lineWidth = boardTools.shape.lineWidth;
                document.getElementById("size").value=boardTools.shape.lineWidth;
                break
        }
        boardTools.tool = t;
    }

    static changeColor (color) {
        boardTools.ctx.strokeStyle = color;
        boardTools.ctx.fillStyle = color;
        boardTools.shape.fillStyle = color;
        boardTools.shape.strokeStyle = color;
        if(document.getElementById("txtText")!==null)
            document.getElementById("txtText").style.color=color
    }

    static changeSize (size) {
        switch(boardTools.tool) {
            case 'pencil':
                boardTools.pencil.lineWidth = size;
                boardTools.ctx.lineWidth = size;
                break
            case'marker':
                boardTools.marker.size = parseInt(boardTools.marker.defaultSize) + parseInt(size);
                boardTools.ctx.lineWidth = boardTools.marker.size;
                break
            case'eraser':
                boardTools.eraser.size = size * 10;
                break
            default:
                boardTools.shape.lineWidth = size;
                boardTools.ctx.lineWidth = size;
                break
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
function drawStart (e) {
    removeBlockClass("fadeInLeft")
    boardTools.mouse.mouseDown = true;
    boardTools.mouse.pos.initial.x = e.pageX
    boardTools.mouse.pos.initial.y = e.pageY
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    boardTools.posScaleI=board.MousePosScale(boardTools.canvas,e)
    if(!boardTools.dragged) {
        switch (boardTools.tool) {
            case 'text':
                if(document.getElementById("txtText")!==null)
                    textInsert()
                removeBlock("txtText")
                var textarea = document.createElement("textarea");
                textarea.id = "txtText"
                textarea.placeholder = "введите текст"

                document.body.appendChild(textarea)
                textarea.autofocus
                textarea.focus()
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
                var x = document.body.clientWidth - boardTools.mouse.pos.initial.x-15
                var y = document.body.clientHeight - boardTools.mouse.pos.initial.y-15
                txtT.style.width = x + "px"
                txtT.style.height = y + "px"
                boardTools.mouse.text.top = boardTools.mouse.pos.initial.y;
                boardTools.mouse.text.left = boardTools.mouse.pos.initial.x;
                txtT.addEventListener("mouseup",textInsert);
                break
            case 'pencil':
                console.log(boardTools.posScaleI.sx+boardTools.offset.x)
                boardTools.last={
                    type: 'pencil',
                    data: {
                        strokeStyle: boardTools.shape.strokeStyle,
                        lineWidth: boardTools.pencil.lineWidth,
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
                        strokeStyle: boardTools.shape.strokeStyle,
                        size: boardTools.marker.size,
                        lineWidth: boardTools.marker.size,
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
                        lineWidth: boardTools.shape.lineWidth,
                        strokeStyle: boardTools.shape.strokeStyle,
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
                        lineWidth: boardTools.shape.lineWidth,
                        strokeStyle: boardTools.shape.strokeStyle,
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
                        strokeStyle: boardTools.shape.strokeStyle,
                        lineWidth: boardTools.shape.lineWidth,
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
                        strokeStyle: boardTools.shape.strokeStyle,
                        lineWidth: boardTools.shape.lineWidth,
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
                        lineWidth: boardTools.shape.lineWidth,
                        strokeStyle: boardTools.shape.strokeStyle,
                        x1: boardTools.posScaleI.sx-(boardTools.offset.x)/boardTools.scale,
                        y1: boardTools.posScaleI.sy-(boardTools.offset.y)/boardTools.scale,
                        x2: posScale.sx-(boardTools.offset.x)/boardTools.scale,
                        y2: posScale.sy-(boardTools.offset.y)/boardTools.scale
                    }
                }
                break
            case 'text':
                document.getElementById("txtText").focus()
                break
        }
        console.log("отправка")
        var result={
            boardData: boardTools.last,
            room: tools.roomname,
            from: tools.username,
        }
        tools.socket.emit('drawing', result);
        var url = boardTools.canvas.toDataURL()
        tools.socket.emit('recover', {
            boardData: {
                type:"recoverImage",
                data: {
                    src: url
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
    }
}
function drawRealT (e) {
    boardTools.mouse.pos.final.x = e.pageX;
    boardTools.mouse.pos.final.y = e.pageY;
    var posScale=board.MousePosScale(boardTools.canvas,e)
    if (boardTools.mouse.mouseDown) {

        if (boardTools.dragged) {
            console.log("dragged")

            board.trackMouse(posScale)
            board.transform(boardTools.ctx)
        }
        else {
            switch (boardTools.tool) {
                case 'pencil':
                    board.pencil(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
                    console.log(posScale.sx-boardTools.offset.x)
                    boardTools.last.data.points.push({
                        x: posScale.sx-(boardTools.offset.x)/boardTools.scale,
                        y: posScale.sy-(boardTools.offset.y)/boardTools.scale
                    });
                    boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                    boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                    break
                case 'marker':
                    board.marker(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.marker.size, boardTools.shape.strokeStyle);
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
                    var x = boardTools.mouse.pos.initial.x + w
                    var y = boardTools.mouse.pos.initial.y + h
                    if (w > 0 && h > 0) {
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    else if (w < 0 && h < 0) {
                        x = boardTools.mouse.pos.final.x + Math.abs(w)
                        y = boardTools.mouse.pos.final.y + Math.abs(h)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    else if (w > 0 && h < 0) {
                        x = boardTools.mouse.pos.initial.x + Math.abs(w)
                        y = boardTools.mouse.pos.final.y + Math.abs(h)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    else if (w < 0 && h > 0) {
                        x = boardTools.mouse.pos.final.x + Math.abs(w)
                        y = boardTools.mouse.pos.initial.y + Math.abs(h)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                    }
                    break
                case "circle":
                    removeBlock("dop")
                    var r = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
                    var xp = boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x
                    var yp = boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
                    var x = boardTools.mouse.pos.initial.x + r
                    var y = boardTools.mouse.pos.initial.y + r
                    if (xp > 0 && yp > 0) {
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                    }
                    else if (xp < 0 && yp < 0) {
                        var x = boardTools.mouse.pos.final.x - r
                        var y = boardTools.mouse.pos.final.y - r
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                    }
                    else if (xp > 0 && yp < 0) {
                        var x = boardTools.mouse.pos.initial.x + Math.abs(r)
                        var y = boardTools.mouse.pos.final.y + Math.abs(r)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                    }
                    else if (xp < 0 && yp > 0) {
                        var x = boardTools.mouse.pos.final.x + Math.abs(r)
                        var y = boardTools.mouse.pos.initial.y + Math.abs(r)
                        board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
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

                    board.eraser(boardTools.ctx, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, 3);
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
document.getElementById("canvas").addEventListener('mousedown',drawStart)
document.getElementById("canvas").addEventListener('touchstart',drawStart)
document.getElementById("canvas").addEventListener('mouseup', drawEnd);
document.getElementById("canvas").addEventListener('touchend', drawEnd);
document.getElementById("canvas").addEventListener('mousemove',drawRealT,false);
document.getElementById("canvas").addEventListener('touchmove',drawRealT,false);
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

function textInsert() {
    var txt=document.getElementById("txtText")
    if(txt.value!=="") {
        boardTools.text.text = txt.value;
        boardTools.ctx.font = boardTools.text.fontStyle + " " + boardTools.text.fontSize + "px " + boardTools.text.fontFamily;
        board.text(boardTools.ctx, txt.value, boardTools.mouse.text.left, boardTools.mouse.text.top + 15);
        var e = {clientX: boardTools.mouse.text.left, clientY: boardTools.mouse.text.top + 15}
        var er = board.MousePosScale(boardTools.canvas, e)
        var res = {
            boardData: {
                type: 'text',
                data: {
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

for(var i=0;i<document.getElementsByClassName("txtFontStyle").length;i++) {
    document.getElementsByClassName("txtFontStyle")[i].addEventListener("click",function () {
        boardTools.text.fontStyle = this.getAttribute("data-value");
        document.getElementsByClassName("boardBtnSelected")[0].classList.value = "tools__item tool boardBtn"
        console.log(document.getElementsByClassName("boardBtnSelected")[0])
        this.classList.add('boardBtnSelected');
    });
}

document.getElementById("txtFontSize").addEventListener("change",function () {
    if(this.value>10 && this.value<72)
        boardTools.text.fontSize = this.value;
    document.getElementById("txtText").style.fontSize=this.value
});

document.getElementById("Italic").addEventListener("click",function(){
    var doc=document.getElementById("txtText")
    if(doc.style.fontStyle==="italic")
        doc.style.fontStyle="normal"
    else doc.style.fontStyle=this.value
})

function handleFileSelect(evt) {
    var files = evt.target.files[0];
    console.log(files)
    board.loadImage(files)
}
var active=false, center={x:0,y:0}, rotation=0, startAngle=0,moveImg=false,posMove={x:0,y:0},changeS={x:0,y:0},resizeImg=false,angle=0,chanL=0

function start(e) {
    var ref = document.getElementsByClassName("drop")[0].getBoundingClientRect()
    center = {
        x: ref.left + (ref.width / 2),
        y: ref.top + (ref.height / 2)
    };
   var x = e.clientX - center.x;
   var y = e.clientY - center.y;
    startAngle = (180 / Math.PI) * Math.atan2(y, x);
    console.log(startAngle)
    console.log(angle)
    active = true;
}

function rotate(e) {
    var x = e.clientX - center.x;
    var y = e.clientY - center.y;

    if (active) {
        var d = (180 / Math.PI) * Math.atan2(y, x);
        rotation = d - startAngle;
        console.log(rotation)
        console.log(angle)
        moveImg = false
        resizeImg = false
        var r = angle + rotation
        document.getElementById("rotation").style.webkitTransform = "rotate(" + r + "deg)";
        console.log("вращение разрешено")
    }
}

function stop() {
    angle += rotation;
    moveImg=false
    active=false
    resizeImg=false
    console.log("вращение остановлено")
};

document.getElementsByClassName("rotator")[0].addEventListener("mousedown",start,false)
document.getElementsByClassName("rotator")[0].addEventListener("mouseup",stop,false)
document.getElementsByClassName("rotator")[0].addEventListener("mousemove",rotate,false)
document.getElementById("LoadedImage").addEventListener("mousemove",rotate,false)
document.getElementById("LoadedImage").addEventListener("mouseup",stop,false)
document.getElementById("LoadedImage").addEventListener("click",stop,false)

function StartSize(){
    var ref = this.getBoundingClientRect()
    changeS={
        x: ref.x,
        y: ref.y
    }
    resizeImg=true
}

function sizeChange(evt){
    var x=evt.clientX-changeS.x
    var x1=x-chanL
    var preload=document.getElementById("preloadImg")
    var prevw=preload.style.width
    prevw=prevw.substr(0,prevw.length-2)
    prevw=parseFloat(prevw)
    var prevh=preload.style.height
    prevh=prevh.substr(0,prevh.length-2)
    prevh=parseFloat(prevh)
    var scale=parseFloat(prevh/prevw)
    prevh+=x1*scale
    prevw+=x1
    if(resizeImg) {
        active=false
        moveImg=false
        chanL=x
        console.log("изменение разрешено")
        console.log(prevw)
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
document.getElementsByClassName("drop")[0].addEventListener("mousedown",moveImgStart,false)
document.getElementsByClassName("drop")[0].addEventListener("mousemove",moveImgF,false)
document.getElementsByClassName("drop")[0].addEventListener("mouseup",moveImgStop,false)

for(var i=0;i<document.getElementsByClassName("grip").length;i++)
{
    document.getElementsByClassName("grip")[i].addEventListener('mousedown', StartSize, false);
    document.getElementsByClassName("grip")[i].addEventListener('mousemove', sizeChange, false);
    document.getElementsByClassName("grip")[i].addEventListener('mouseup', EndSize, false);

}
document.getElementById("LoadedImage").addEventListener("mouseup",EndSize,false)
document.getElementById("LoadedImage").addEventListener("mousemove",sizeChange,false)
document.getElementsByClassName("drop")[0].addEventListener('mouseup', EndSize, false);

document.getElementById('ImageLoad').addEventListener('change', handleFileSelect, false);

document.getElementById("ImgLoadCanvas").addEventListener("click",function() {
    var x=document.getElementsByClassName("drop")[0].style.left
    x=x.substr(0,x.length-2)
    x=parseInt(x)
    var y=document.getElementsByClassName("drop")[0].style.top
    var d=document.getElementById("rotation").style.transform
    y=y.substr(0,y.length-2)
    y=parseInt(y)
    var de=d.split("(")
    d=de[1].substr(0,de[1].length-4)
    var deg=parseFloat(d)
    var h=document.getElementById("preloadImg").style.height
    h=h.substr(0,h.length-2)
    h=parseInt(h)
    var w=document.getElementById("preloadImg").style.width
    w=w.substr(0,w.length-2)
    w=parseInt(w)
    var image=new Image()
    image.onload=function() {
        var e={clientX:x,clientY:y}
        var es=board.MousePosScale(boardTools.canvas,e)
        board.drawImageRot(boardTools.ctx,image,x,y,w,h,deg)
        let res={
            boardData: {
                type:"image",
                data: {
                    src: image.src,
                    points: [{
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        deg:deg
                    }]
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
    document.getElementById("LoadedImage").style.display="none"
    document.getElementById("preloadImg").src=""
    document.getElementById("rotation").style.transform="rotate("+0+"deg)"
    document.getElementsByClassName("drop")[0].style.width=0
    document.getElementsByClassName("drop")[0].style.height=0
    document.getElementsByClassName("drop")[0].style.left=0
    document.getElementsByClassName("drop")[0].style.top=0
    document.getElementById("preloadImg").style.height=0
    document.getElementById("preloadImg").style.width=0
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
        boardTools.canvas.style.cursor="grab"
    }
    else {
        boardTools.dragged=false
        boardTools.canvas.style.cursor="crosshair"
    }
})
document.getElementById("canvas").addEventListener('DOMMouseScroll',Scroll,false);
document.getElementById("canvas").addEventListener('mousewheel',Scroll,false);
 function Scroll(evt){
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;

    if (delta>0)
         boardTools.scale+=0.1
    else
        boardTools.scale-=0.1
     board.transform(boardTools.ctx);
    return evt.preventDefault() && false;
};