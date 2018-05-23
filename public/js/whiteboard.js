var boardTools= {
    pencil: {
        lineWidth: 1
    },
    marker: {
        defaultSize: 5,
        size: 6,
        opacity: 0.3
    },
    eraser: {
        size: 10,
        lineWidth: 1,
        fillStyle: 'white',
        opacity:0
    },
    text: {
        flag: 0,
        color: 'black',
        text: '',
        fontFamily: 'cursive',
        fontSize: 12,
        fontStyle: 'bold'
    },
    shape: {
        lineWidth: 1,
        fillStyle: 'black',
        strokeStyle: 'black'
    },
    canvas: document.getElementById("canvas"),
    ctx: document.getElementById("canvas").getContext('2d'),
    mouse: {
        mouseDown: false,
        pos: {
            initial: {x: 0, y: 0},
            final: {x: 0, y: 0}
        },
        text:{top:0,left:0}
    },
    height: window.screen.availHeight,
    width: window.screen.availWidth,
    tool: 'pencil',
    draw: {},
}
class board  {

    static shapeSVG(stroke){
        var xmlns = "http://www.w3.org/2000/svg";
        var svg= document.createElementNS(xmlns, "svg");
        svg.id="dop"
        svg.style.width=board.width
        svg.style.height=board.height
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
        var reader = new FileReader();
        reader.onload = function(evt){
            document.getElementById("preloadImg").src=evt.target.result
            var pic = new Image();
            pic.src    = evt.target.result;
            pic.onload = function() {
                if(this.width>board.width/2 || this.height>board.height/2) {
                    var resx=this.width*0.3
                    var resy=this.height*0.3
                    var x=(board.width-resx)/2
                    var y=(board.height-resy)/2
                    document.getElementById("preloadImg").style.height=resy+"px"
                    document.getElementById("preloadImg").style.width=resx+"px"
                    document.getElementsByClassName("drop")[0].style.left=x+"px"
                    document.getElementsByClassName("drop")[0].style.top=y+"px"
                }
                else {
                    var x=(board.width-this.width)/2
                    var y=(board.height-this.height)/2
                    document.getElementById("preloadImg").style.height = this.height + "px"
                    document.getElementById("preloadImg").style.width = this.width + "px"
                    document.getElementsByClassName("drop")[0].style.left = x + "px"
                    document.getElementsByClassName("drop")[0].style.top = y + "px"
                }
            }
        };
        reader.readAsDataURL(data);
    }
    static  drawImageRot (context,img,x,y,width,height,deg){
        var rad = deg * Math.PI / 180;
        console.log(context)
        context.translate(x + width / 2, y + height / 2);

        context.rotate(rad);

        context.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);

        context.rotate(rad * (-1));
        context.translate((x + width / 2) * (-1), (y + height / 2) * (-1));

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
        context.arc(boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, board.boardTools.eraser.size, 0, 2 * Math.PI);
        context.fill();

    }

    static changeTool (t) {

        switch(t) {

            case 'pencil':
                boardTools.ctx.lineWidth = board.boardTools.pencil.lineWidth;
                document.getElementById("size").value=board.boardTools.pencil.lineWidth;
                boardTools.draw={
                    type: 'pencil',
                    data: []
                }
                break
            case 'marker':
                boardTools.ctx.lineWidth = board.boardTools.marker.size;
                document.getElementById("size").value=parseInt(board.boardTools.marker.size) - parseInt(board.boardTools.marker.defaultSize);
                boardTools.draw={
                    type: 'marker',
                    data: []}
                break
            case'eraser':
                boardTools.ctx.lineWidth = board.boardTools.eraser.lineWidth;
                document.getElementById("size").value=parseInt(boardTools.eraser.size) / 10;
                break

            case 'text':
                document.getElementById("textControl").style.visibility="visible";
                break
            default:
                boardTools.ctx.lineWidth = board.boardTools.shape.lineWidth;
                document.getElementById("size").value=board.boardTools.shape.lineWidth;
                break
        }
        boardTools.tool = t;
    }

    static changeColor (color) {
        boardTools.ctx.strokeStyle = color;
        boardTools.ctx.fillStyle = color;
        boardTools.shape.fillStyle = color;
        boardTools.shape.strokeStyle = color;
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
    boardTools.mouse.pos.initial.x = e.pageX;
    boardTools.mouse.pos.initial.y = e.pageY;
    switch(boardTools.tool) {
        case 'text':
            removeBlock("txtText")
            var textarea= document.createElement("textarea");
            textarea.id="txtText"
            textarea.placeholder="введите текст"
            document.body.appendChild(textarea)
            // $("body").append("<textarea id=\"txtText\" class=\"boardBtn\" placeholder='введите текст' value=\"12\" max=\"72\" min=\"8\" type=\"number\"></textarea>")
            document.getElementById("txtText").style.left=boardTools.mouse.pos.final.x+"px"
            document.getElementById("txtText").style.top=boardTools.mouse.pos.final.y+"px"
            document.getElementById("textControl").style.marginLeft=boardTools.mouse.pos.final.x+"px"
            document.getElementById("textControl").style.marginTop=boardTools.mouse.pos.final.y+"px"
            var x=boardTools.width-boardTools.mouse.pos.final.x
            var y=boardTools.height-boardTools.mouse.pos.final.y
            document.getElementById("txtText").style.width=x+"px"
            document.getElementById("txtText").style.height=y+"px"
            boardTools.mouse.text.top=boardTools.mouse.pos.final.y;
            boardTools.mouse.text.left=boardTools.mouse.pos.final.x;
            boardTools.text.flag = 0;
            break
        case 'pencil':
            removeBlock("txtText")
            boardTools.draw={
                type: 'pencil',
                data: {
                    strokeStyle: boardTools.shape.strokeStyle,
                    lineWidth: boardTools.pencil.lineWidth,
                    points: [{
                        x: boardTools.mouse.pos.initial.x,
                        y: boardTools.mouse.pos.initial.y
                    }]
                }
            }
            break
        case 'marker':
            removeBlock("txtText")
            boardTools.draw={
                type: 'marker',
                data: {
                    strokeStyle: boardTools.shape.strokeStyle,
                    size: boardTools.marker.size,
                    lineWidth: boardTools.marker.size,
                    points: [{
                        x: boardTools.mouse.pos.initial.x,
                        y: boardTools.mouse.pos.initial.y
                    }]
                }
            }
            break
        case 'eraser':
            removeBlock("txtText")
            boardTools.draw={
                type: 'eraser',
                data: {
                    size: boardTools.eraser.size,
                    points: [{
                        x: boardTools.mouse.pos.initial.x,
                        y: boardTools.mouse.pos.initial.y
                    }]
                }
            }
            break
    }
}

function drawEnd() {

    boardTools.mouse.mouseDown = false;

    switch (boardTools.tool) {
        case 'line':
            removeBlock("dop")
            removeBlock("txtText")
            board.line(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
            boardTools.draw={
                type: 'line',
                data: {
                    lineWidth: boardTools.shape.lineWidth,
                    strokeStyle: boardTools.shape.strokeStyle,
                    x1: boardTools.mouse.pos.initial.x,
                    y1: boardTools.mouse.pos.initial.y,
                    x2: boardTools.mouse.pos.final.x,
                    y2: boardTools.mouse.pos.final.y
                }
            }
            break
        case'rectangle':
            removeBlock("dop")
            removeBlock("txtText")
            board.rect(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x, boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y);
            boardTools.draw={
                type: 'rectangle',
                data: {
                    lineWidth: boardTools.shape.lineWidth,
                    strokeStyle: boardTools.shape.strokeStyle,
                    x: boardTools.mouse.pos.initial.x,
                    y: boardTools.mouse.pos.initial.y,
                    w: boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x,
                    h: boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
                }
            }
            break
        case 'circle':
            removeBlock("dop")
            removeBlock("txtText")
            board.circle(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
            boardTools.draw={
                type: 'circle',
                data: {
                    strokeStyle: boardTools.shape.strokeStyle,
                    lineWidth: boardTools.shape.lineWidth,
                    x1: boardTools.mouse.pos.initial.x,
                    y1: boardTools.mouse.pos.initial.y,
                    x2: boardTools.mouse.pos.final.x,
                    y2: boardTools.mouse.pos.final.y
                }
            }
            break
        case 'ellipse':
            removeBlock("dop")
            removeBlock("txtText")
            board.ellipse(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x, boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y);
            boardTools.draw={
                type: 'ellipse',
                data: {
                    strokeStyle: boardTools.shape.strokeStyle,
                    lineWidth: boardTools.shape.lineWidth,
                    x: boardTools.mouse.pos.initial.x,
                    y: boardTools.mouse.pos.initial.y,
                    w: boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x,
                    h: boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
                }
            }
            break
        case 'arrow':
            removeBlock("txtText")
            removeBlock("dop")
            board.arrow(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
            boardTools.draw={
                type: 'arrow',
                data: {
                    strokeStyle: boardTools.shape.strokeStyle,
                    lineWidth: boardTools.shape.lineWidth,
                    x1: boardTools.mouse.pos.initial.x,
                    y1: boardTools.mouse.pos.initial.y,
                    x2: boardTools.mouse.pos.final.x,
                    y2: boardTools.mouse.pos.final.y
                }
            }
            break
    }
    console.log("отправка")
    tools.socket.emit('drawing', {
        boardData: boardTools.draw,
        room: tools.roomname,
        from: tools.username
    });
}
function drawRealT (e) {

    boardTools.mouse.pos.final.x = e.pageX;
    boardTools.mouse.pos.final.y = e.pageY;
    if (boardTools.mouse.mouseDown) {

        switch (boardTools.tool) {
            case 'pencil':
                board.pencil(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);

                boardTools.draw.data.points.push({
                    x: boardTools.mouse.pos.final.x,
                    y: boardTools.mouse.pos.final.y
                });
                boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                break
            case 'marker':
                board.marker(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.marker.size, boardTools.shape.strokeStyle);
                boardTools.draw.data.points.push({
                    x: boardTools.mouse.pos.final.x,
                    y: boardTools.mouse.pos.final.y
                });
                boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                break
            case 'rectangle':
                removeBlock("dop")
                var x = boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x
                var y = boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
                if (x > 0 && y > 0) {
                    board.shapeSVG("rect x="+boardTools.mouse.pos.initial.x+" y="+boardTools.mouse.pos.initial.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                }
                else if (x < 0 && y < 0) {
                    board.shapeSVG("rect x="+boardTools.mouse.pos.final.x+" y="+boardTools.mouse.pos.final.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                }
                else if (x > 0 && y < 0) {
                    board.shapeSVG("rect x="+boardTools.mouse.pos.initial.x+" y="+boardTools.mouse.pos.final.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                }
                else if (x < 0 && y > 0) {
                    board.shapeSVG("rect x="+boardTools.mouse.pos.final.x+" y="+boardTools.mouse.pos.initial.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                }
                break
            case 'ellipse':
                removeBlock("dop")
                var w = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
                var h = (boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y) / 2
                var x = boardTools.mouse.pos.initial.x + w
                var y = boardTools.mouse.pos.initial.y + h
                if(w>0 &&h>0) {
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                }
                else if(w<0 && h<0){
                    x = boardTools.mouse.pos.final.x + Math.abs(w)
                    y = boardTools.mouse.pos.final.y + Math.abs(h)
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                }
                else if(w>0 && h<0){
                    x = boardTools.mouse.pos.initial.x + Math.abs(w)
                    y = boardTools.mouse.pos.final.y + Math.abs(h)
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                }
                else if(w<0 && h>0){
                    x = boardTools.mouse.pos.final.x + Math.abs(w)
                    y = boardTools.mouse.pos.initial.y + Math.abs(h)
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                }
                break
            case "circle":
                removeBlock("dop")
                var r = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
                var xp=boardTools.mouse.pos.final.x-boardTools.mouse.pos.initial.x
                var yp=boardTools.mouse.pos.final.y-boardTools.mouse.pos.initial.y
                var x = boardTools.mouse.pos.initial.x+r
                var y = boardTools.mouse.pos.initial.y+r
                if(xp>0 &&yp>0) {
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                }
                else if(xp<0 &&yp<0) {
                    var x = boardTools.mouse.pos.final.x-r
                    var y = boardTools.mouse.pos.final.y-r
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                }
                else if(xp>0 &&yp<0)
                {
                    var x = boardTools.mouse.pos.initial.x+Math.abs(r)
                    var y = boardTools.mouse.pos.final.y+Math.abs(r)
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                }
                else if(xp<0 &&yp>0)
                {
                    var x = boardTools.mouse.pos.final.x+Math.abs(r)
                    var y = boardTools.mouse.pos.initial.y+Math.abs(r)
                    board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
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
                boardTools.draw.data.points.push({
                    x: boardTools.mouse.pos.final.x,
                    y: boardTools.mouse.pos.final.y
                });
                boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
                boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
                break
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
        console.log(this.parentNode.childNodes[3])
        removeBlock("txtText")
    });
}
for(var i=0;i<document.getElementsByClassName("predefined__color").length;i++) {
    document.getElementsByClassName("predefined__color")[i].addEventListener("click",function () {
        var color = this.style.backgroundColor;
        console.log(color)
        var colorPick = document.getElementsByClassName("picked__color")
        console.log(colorPick)
        colorPick[0].style = "background-color:" + color
        board.changeColor(color);
        var r = document.getElementsByClassName("visible")[0].classList
        console.log(r)
        r.value = "toolbox fadeInLeft"
    })
}

document.getElementById("size").addEventListener("change",function () {
    board.changeSize(this.value);
});

document.getElementById("txtInsert").addEventListener("click",function () {
    boardTools.text.flag = 1;
    boardTools.text.text = document.getElementById("txtText").value;
    boardTools.ctx.font = boardTools.text.fontStyle + " " + boardTools.text.fontSize + "px " + boardTools.text.fontFamily;
    //   document.getElementById("textControl").style.visibility="hidden"
    board.text(boardTools.ctx, document.getElementById("txtText").value, boardTools.mouse.text.left+5, boardTools.mouse.text.top+5);
    this.rtSocket.socket.emit('drawing', {
        boardData: {
            type: 'text',
            data: {
                font: boardTools.ctx.font,
                fillStyle: boardTools.ctx.fillStyle,
                text: document.getElementById("txtText").value,
                x: boardTools.mouse.text.left+5,
                y: boardTools.mouse.text.top+5
            }
        },
        room: this.rtSocket.roomname,
        from: this.rtSocket.username
    });
    document.getElementById("txtText").value=""
    removeBlock("txtText")
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
    board.boardTools.text.fontSize = this.value;
});

function handleFileSelect(evt) {
    var files = evt.target.files[0];
    console.log(files)
    board.loadImage(files)
}
var active=false, center={x:0,y:0}, rotation=0, startAngle=0,moveImg=false,posMove={x:0,y:0},changeS={x:0,y:0},resizeImg=false,angle=0,chanL=0,startWH

function start(e) {
    var ref = document.getElementsByClassName("drop")[0].getBoundingClientRect()
    center = {
        x: ref.left + (ref.width / 2),
        y: ref.top + (ref.height / 2)
    };
    x = e.clientX - center.x;
    y = e.clientY - center.y;
    startAngle = (180 / Math.PI) * Math.atan2(y, x);
    return active = true;
}

function rotate(e) {
    var x = e.clientX - center.x;
    var y = e.clientY - center.y;
    var d = (180 / Math.PI) * Math.atan2(y, x);
    rotation = d - startAngle;
    if (active) {
        moveImg = false
        resizeImg = false
        var r = angle + rotation
        document.getElementById("rotation").style.webkitTransform = "rotate(" + r + "deg)";
        console.log("вращение разрешено")
    }
};

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
    console.log(ref)
    changeS={
        x: ref.x,
        y: ref.y
    }
    console.log("начинаем изменение размера")
    console.log(document.getElementById("preloadImg").style.width)
    resizeImg=true
}

function sizeChange(evt){
    var x=evt.clientX-changeS.x
    var x1=x-chanL
    var prevw=document.getElementById("preloadImg").style.width
    console.log(document.getElementById("preloadImg").style.width)
    console.log(prevw)
    prevw=prevw.substr(0,prevw.length-2)
    prevw=parseFloat(prevw)
    var prevh=document.getElementById("preloadImg").style.height
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
        document.getElementById("preloadImg").style.width=prevw+"px"
        document.getElementById("preloadImg").style.height=prevh+"px"
        //  document.getElementsByClassName("drop")[0].style.left=x+"px"
        //   document.getElementsByClassName("drop")[0].style.top=y+"px"
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
        board.drawImageRot(boardTools.ctx,image,x,y,w,h,deg)
        this.rtSocket.socket.emit('drawing', {
            boardData: {
                type:"image",
                data: {
                    src: document.getElementById("preloadImg").src.toString(),
                    points: [{
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        deg:deg
                    }]
                }
            },
            room: this.rtSocket.roomname,
            from: this.rtSocket.username
        });
        document.getElementById("LoadedImage").style.display="none"
        document.getElementById("preloadImg").src=""
    }
    image.src=document.getElementById("preloadImg").src
    document.getElementById("rotation").style.transform="rotate("+0+"deg)"
    angle=0
    boardTools.tool = "pencil";
})
document.getElementById("CancelCanvas").addEventListener("click",function(){
    document.getElementById("LoadedImage").style.display="none"
    document.getElementById("preloadImg").src=""
    document.getElementById("rotation").style.transform="rotate("+0+"deg)"
    angle=0
    boardTools.tool = "pencil";
})
document.getElementById("saveImage").addEventListener("click",function(){
    var url = boardTools.canvas.toDataURL()
    console.log("картинка")
    console.log(url)
    var img=dataURItoBlob(url)
    console.log(img)

    document.getElementById("ImgSave").href = url;
    document.getElementById("ImgSave").download = "image.png";
    boardTools.tool = "pencil";
})

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);

    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    var blob = new Blob([ab], {type: mimeString});
    return blob;

}
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
