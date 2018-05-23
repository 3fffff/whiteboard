   window.onload = function () {
        var board = {
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

            drawings: {
                raw: []
            },

            tools: {

                pencil: {
                    lineWidth: 1
                },

                chalk: {
                    defaultSize: 5,
                    size: 6
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
                }
            },
            shapeSVG:function(stroke){
                var xmlns = "http://www.w3.org/2000/svg";
                var svg= document.createElementNS(xmlns, "svg");
                svg.id="dop"
                svg.style.width=board.width
                svg.style.height=board.height
                svg.innerHTML+= "  <"+stroke + " style=\"fill:rgba(152,255,226,0.5);stroke-width:3;stroke:#00efff\" />\n"
                    document.body.appendChild(svg)
            },
            drawer: {

                pencil: function (context, x1, y1, x2, y2) {
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();

                },

                marker: function (context, x1, y1, x2, y2, size, color) {

                    context.globalAlpha = board.tools.marker.opacity;

                    context.strokeStyle = color; 
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();

                    context.globalAlpha = 1;
                    context.lineWidth = size;

                },

                chalk: function (context, x1, y1, x2, y2, size) {

                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();
					
                    var length = Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / (5 / size));
                    var xUnit = (x2 - x1) / length;
                    var yUnit = (y2 - y1) / length;
                    for (var i = 0; i < length; i++) {
                        var xCurrent = x1 + (i * xUnit);
                        var yCurrent = y1 + (i * yUnit);
                        var xRandom = xCurrent + (Math.random() - 0.5) * size * 1.2;
                        var yRandom = yCurrent + (Math.random() - 0.5) * size * 1.2;
                        context.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
                    }
                },

                text: function (context, text, x, y) {
                    context.fillText(text, x, y);
                },

                loadImage:function(data){
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
                },
                drawImageRot:function (context,img,x,y,width,height,deg){
                        var rad = deg * Math.PI / 180;
                        console.log(context)
                        context.translate(x + width / 2, y + height / 2);

                        context.rotate(rad);

                        context.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);

                        context.rotate(rad * (-1));
                        context.translate((x + width / 2) * (-1), (y + height / 2) * (-1));

                },

                rect: function (context, x, y, w, h) {
                    context.strokeRect(x, y, w, h);
                },

                circle: function (context, x1, y1, x2, y2) {

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
                },

                ellipse: function (context, x, y, w, h) {
                    context.beginPath();
                    context.ellipse(x+w/2, y+h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, 2 * Math.PI);
                    context.stroke();

                },

                line: function (context, x1, y1, x2, y2) {

                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();

                },
                arrow: function (context, x1, y1, x2, y2) {

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
                },
                eraser: function(context){
                    context.beginPath();
                    context.fillStyle = "white";
                    context.arc(board.mouse.pos.final.x, board.mouse.pos.final.y, board.tools.eraser.size, 0, 2 * Math.PI);
                    context.fill();

                }
            },

            changeTool: function (t) {
				
				switch(t) {

                    case 'pencil':
                        board.ctx.lineWidth = board.tools.pencil.lineWidth;
                        document.getElementById("size").value=board.tools.pencil.lineWidth;
                        board.drawings.raw.push({
                            type: 'pencil',
                            data: []
                        })
                        break
                    case 'chalk':
                        board.ctx.lineWidth = board.tools.chalk.size;
                        document.getElementById("size").value=parseInt(board.tools.chalk.size) - parseInt(board.tools.chalk.defaultSize);
                        board.drawings.raw.push({
                            type: 'chalk',
                            data: []
                        });
                        break
                    case 'marker':
                        board.ctx.lineWidth = board.tools.marker.size;
                        document.getElementById("size").value=parseInt(board.tools.marker.size) - parseInt(board.tools.marker.defaultSize);
                        board.drawings.raw.push({
                            type: 'marker',
                            data: []});
                        break
                    case'eraser':
                            board.ctx.lineWidth = board.tools.eraser.lineWidth;
                            document.getElementById("size").value=parseInt(board.tools.eraser.size) / 10;
                            break

                    case 'text':
                           document.getElementById("textControl").style.visibility="visible";
                            break
                    default:
                        board.ctx.lineWidth = board.tools.shape.lineWidth;
                        document.getElementById("size").value=board.tools.shape.lineWidth;
                        break
                }
                this.tool = t;
            },

            changeColor: function (color) {
                board.ctx.strokeStyle = color;
                board.ctx.fillStyle = color;
                board.tools.shape.fillStyle = color;
                board.tools.shape.strokeStyle = color;
            },

            changeSize: function (size) {
                switch(board.tool) {
                    case 'pencil':
                        board.tools.pencil.lineWidth = size;
                        board.ctx.lineWidth = size;
                        break
                    case 'chalk':
                        board.tools.chalk.size = parseInt(board.tools.chalk.defaultSize) + parseInt(size);
                        board.ctx.lineWidth = board.tools.chalk.size;
                        break
                    case'marker':
                        board.tools.marker.size = parseInt(board.tools.marker.defaultSize) + parseInt(size);
                        board.ctx.lineWidth = board.tools.marker.size;
                        break
                    case'eraser':
                        board.tools.eraser.size = size * 10;
                        break
                    default:
                        board.tools.shape.lineWidth = size;
                        board.ctx.lineWidth = size;
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

           board.mouse.mouseDown = true;
           board.mouse.pos.initial.x = e.pageX;
           board.mouse.pos.initial.y = e.pageY;
           switch(board.tool) {
               case 'text':
                   removeBlock("txtText")
                   var textarea= document.createElement("textarea");
                   textarea.id="txtText"
                   textarea.placeholder="введите текст"
                  document.body.appendChild(textarea)
                   // $("body").append("<textarea id=\"txtText\" class=\"boardBtn\" placeholder='введите текст' value=\"12\" max=\"72\" min=\"8\" type=\"number\"></textarea>")
                   document.getElementById("txtText").style.left=board.mouse.pos.final.x+"px"
                   document.getElementById("txtText").style.top=board.mouse.pos.final.y+"px"
                   document.getElementById("textControl").style.marginLeft=board.mouse.pos.final.x+"px"
                   document.getElementById("textControl").style.marginTop=board.mouse.pos.final.y+"px"
                   var x=board.width-board.mouse.pos.final.x
                   var y=board.height-board.mouse.pos.final.y
                   document.getElementById("txtText").style.width=x+"px"
                   document.getElementById("txtText").style.height=y+"px"
                   board.mouse.text.top=board.mouse.pos.final.y;
                   board.mouse.text.left=board.mouse.pos.final.x;
                   board.tools.text.flag = 0;
                   break
               case 'pencil':
                   removeBlock("txtText")
                   board.drawings.raw.push({
                       type: 'pencil',
                       data: {
                           strokeStyle: board.tools.shape.strokeStyle,
                           lineWidth: board.tools.pencil.lineWidth,
                           points: [{
                               x: board.mouse.pos.initial.x,
                               y: board.mouse.pos.initial.y
                           }]
                       }
                   });
                   break
               case 'chalk':
                   removeBlock("txtText")
                   board.drawings.raw.push({
                       type: 'chalk',
                       data: {
                           strokeStyle: board.tools.shape.strokeStyle,
                           size: board.tools.chalk.size,
                           lineWidth: board.tools.chalk.size,
                           points: [{
                               x: board.mouse.pos.initial.x,
                               y: board.mouse.pos.initial.y
                           }]
                       }
                   });
                   break
               case 'marker':
                   removeBlock("txtText")
                   board.drawings.raw.push({
                       type: 'marker',
                       data: {
                           strokeStyle: board.tools.shape.strokeStyle,
                           size: board.tools.marker.size,
                           lineWidth: board.tools.marker.size,
                           points: [{
                               x: board.mouse.pos.initial.x,
                               y: board.mouse.pos.initial.y
                           }]
                       }
                   });
                   break
               case 'eraser':
                   removeBlock("txtText")
                   board.drawings.raw.push({
                       type: 'eraser',
                       data: {
                           size: board.tools.eraser.size,
                           points: [{
                               x: board.mouse.pos.initial.x,
                               y: board.mouse.pos.initial.y
                           }]
                       }
                   });
                   break
           }
       }

   function drawEnd() {

       board.mouse.mouseDown = false;

       switch (board.tool) {
           case 'line':
               removeBlock("dop")
               removeBlock("txtText")
               board.drawer.line(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x, board.mouse.pos.final.y);
               board.drawings.raw.push({
                   type: 'line',
                   data: {
                       lineWidth: board.tools.shape.lineWidth,
                       strokeStyle: board.tools.shape.strokeStyle,
                       x1: board.mouse.pos.initial.x,
                       y1: board.mouse.pos.initial.y,
                       x2: board.mouse.pos.final.x,
                       y2: board.mouse.pos.final.y
                   }
               });
               break
           case'rectangle':
               removeBlock("dop")
               removeBlock("txtText")
               board.drawer.rect(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x - board.mouse.pos.initial.x, board.mouse.pos.final.y - board.mouse.pos.initial.y);
               board.drawings.raw.push({
                   type: 'rectangle',
                   data: {
                       lineWidth: board.tools.shape.lineWidth,
                       strokeStyle: board.tools.shape.strokeStyle,
                       x: board.mouse.pos.initial.x,
                       y: board.mouse.pos.initial.y,
                       w: board.mouse.pos.final.x - board.mouse.pos.initial.x,
                       h: board.mouse.pos.final.y - board.mouse.pos.initial.y
                   }
               });
               break
           case 'circle':
               removeBlock("dop")
               removeBlock("txtText")
               board.drawer.circle(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x, board.mouse.pos.final.y);
               board.drawings.raw.push({
                   type: 'circle',
                   data: {
                       strokeStyle: board.tools.shape.strokeStyle,
                       lineWidth: board.tools.shape.lineWidth,
                       x1: board.mouse.pos.initial.x,
                       y1: board.mouse.pos.initial.y,
                       x2: board.mouse.pos.final.x,
                       y2: board.mouse.pos.final.y
                   }
               });
               break
           case 'ellipse':
               removeBlock("dop")
               removeBlock("txtText")
               board.drawer.ellipse(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x - board.mouse.pos.initial.x, board.mouse.pos.final.y - board.mouse.pos.initial.y);
               board.drawings.raw.push({
                   type: 'ellipse',
                   data: {
                       strokeStyle: board.tools.shape.strokeStyle,
                       lineWidth: board.tools.shape.lineWidth,
                       x: board.mouse.pos.initial.x,
                       y: board.mouse.pos.initial.y,
                       w: board.mouse.pos.final.x - board.mouse.pos.initial.x,
                       h: board.mouse.pos.final.y - board.mouse.pos.initial.y
                   }
               });
               break
           case 'arrow':
               removeBlock("txtText")
               removeBlock("dop")
               board.drawer.arrow(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x, board.mouse.pos.final.y);
               board.drawings.raw.push({
                   type: 'arrow',
                   data: {
                       strokeStyle: board.tools.shape.strokeStyle,
                       lineWidth: board.tools.shape.lineWidth,
                       x1: board.mouse.pos.initial.x,
                       y1: board.mouse.pos.initial.y,
                       x2: board.mouse.pos.final.x,
                       y2: board.mouse.pos.final.y
                   }
               });
               break
       }
       console.log("отправка")
       rtMan.socket.emit('drawing', {
           boardData: board.drawings.raw[board.drawings.raw.length - 1],
           room: rtMan.roomname,
           from: rtMan.username
       });
   }
       function drawRealT (e) {

           board.mouse.pos.final.x = e.pageX;
           board.mouse.pos.final.y = e.pageY;
           if (board.mouse.mouseDown) {

               switch (board.tool) {
                   case 'pencil':
                       board.drawer.pencil(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x, board.mouse.pos.final.y);

                       board.drawings.raw[board.drawings.raw.length - 1].data.points.push({
                           x: board.mouse.pos.final.x,
                           y: board.mouse.pos.final.y
                       });
                       board.mouse.pos.initial.x = board.mouse.pos.final.x;
                       board.mouse.pos.initial.y = board.mouse.pos.final.y;
                       break
                   case 'chalk':
                       board.drawer.chalk(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x, board.mouse.pos.final.y, board.tools.chalk.size);

                       board.drawings.raw[board.drawings.raw.length - 1].data.points.push({
                           x: board.mouse.pos.final.x,
                           y: board.mouse.pos.final.y
                       });
                       board.mouse.pos.initial.x = board.mouse.pos.final.x;
                       board.mouse.pos.initial.y = board.mouse.pos.final.y;
                       break
                   case 'marker':
                       board.drawer.marker(board.ctx, board.mouse.pos.initial.x, board.mouse.pos.initial.y, board.mouse.pos.final.x, board.mouse.pos.final.y, board.tools.marker.size, board.tools.shape.strokeStyle);
                       board.drawings.raw[board.drawings.raw.length - 1].data.points.push({
                           x: board.mouse.pos.final.x,
                           y: board.mouse.pos.final.y
                       });
                       board.mouse.pos.initial.x = board.mouse.pos.final.x;
                       board.mouse.pos.initial.y = board.mouse.pos.final.y;
                       break
                   case 'rectangle':
                       removeBlock("dop")
                       var x = board.mouse.pos.final.x - board.mouse.pos.initial.x
                       var y = board.mouse.pos.final.y - board.mouse.pos.initial.y
                       if (x > 0 && y > 0) {
                           board.shapeSVG("rect x="+board.mouse.pos.initial.x+" y="+board.mouse.pos.initial.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                       }
                       else if (x < 0 && y < 0) {
                           board.shapeSVG("rect x="+board.mouse.pos.final.x+" y="+board.mouse.pos.final.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                       }
                       else if (x > 0 && y < 0) {
                           board.shapeSVG("rect x="+board.mouse.pos.initial.x+" y="+board.mouse.pos.final.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                       }
                       else if (x < 0 && y > 0) {
                           board.shapeSVG("rect x="+board.mouse.pos.final.x+" y="+board.mouse.pos.initial.y+" width="+Math.abs(x)+" height="+Math.abs(y))
                       }
                       break
                   case 'ellipse':
                       removeBlock("dop")
                       var w = (board.mouse.pos.final.x - board.mouse.pos.initial.x) / 2
                       var h = (board.mouse.pos.final.y - board.mouse.pos.initial.y) / 2
                       var x = board.mouse.pos.initial.x + w
                       var y = board.mouse.pos.initial.y + h
                       if(w>0 &&h>0) {
                           board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                       }
                       else if(w<0 && h<0){
                            x = board.mouse.pos.final.x + Math.abs(w)
                            y = board.mouse.pos.final.y + Math.abs(h)
                           board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                       }
                       else if(w>0 && h<0){
                           x = board.mouse.pos.initial.x + Math.abs(w)
                           y = board.mouse.pos.final.y + Math.abs(h)
                           board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                       }
                       else if(w<0 && h>0){
                           x = board.mouse.pos.final.x + Math.abs(w)
                           y = board.mouse.pos.initial.y + Math.abs(h)
                           board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
                       }
                       break
                   case "circle":
                       removeBlock("dop")
                       var r = (board.mouse.pos.final.x - board.mouse.pos.initial.x) / 2
                       var xp=board.mouse.pos.final.x-board.mouse.pos.initial.x
                       var yp=board.mouse.pos.final.y-board.mouse.pos.initial.y
                       var x = board.mouse.pos.initial.x+r
                       var y = board.mouse.pos.initial.y+r
                        if(xp>0 &&yp>0) {
                            board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                        }
                      else if(xp<0 &&yp<0) {
                            var x = board.mouse.pos.final.x-r
                            var y = board.mouse.pos.final.y-r
                            board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                       }
                       else if(xp>0 &&yp<0)
                        {
                            var x = board.mouse.pos.initial.x+Math.abs(r)
                            var y = board.mouse.pos.final.y+Math.abs(r)
                            board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                        }
                        else if(xp<0 &&yp>0)
                        {
                            var x = board.mouse.pos.final.x+Math.abs(r)
                            var y = board.mouse.pos.initial.y+Math.abs(r)
                            board.shapeSVG( "ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(r) + " ry=" + Math.abs(r))
                        }
                       break
                   case 'arrow':
                       removeBlock("dop")
                       board.shapeSVG("line x1=" + board.mouse.pos.initial.x + " y1=" + board.mouse.pos.initial.y + " x2=" + board.mouse.pos.final.x + " y2=" + board.mouse.pos.final.y)
                       break
                   case 'line':
                       removeBlock("dop")
                       board.shapeSVG("line x1=" + board.mouse.pos.initial.x + " y1=" + board.mouse.pos.initial.y + " x2=" + board.mouse.pos.final.x + " y2=" + board.mouse.pos.final.y)
                       break
                   case 'eraser':

                       board.drawer.eraser(board.ctx, board.mouse.pos.final.x, board.mouse.pos.final.y, 3);
                       board.drawings.raw[board.drawings.raw.length - 1].data.points.push({
                           x: board.mouse.pos.final.x,
                           y: board.mouse.pos.final.y
                       });
                       board.mouse.pos.initial.x = board.mouse.pos.final.x;
                       board.mouse.pos.initial.y = board.mouse.pos.final.y;
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
            board.tools.text.flag = 1;
            board.tools.text.text = document.getElementById("txtText").value;
            board.ctx.font = board.tools.text.fontStyle + " " + board.tools.text.fontSize + "px " + board.tools.text.fontFamily;
         //   document.getElementById("textControl").style.visibility="hidden"
           board.drawer.text(board.ctx, document.getElementById("txtText").value, board.mouse.text.left+5, board.mouse.text.top+5);
           rtMan.socket.emit('drawing', {
               boardData: {
                   type: 'text',
                   data: {
                       font: board.ctx.font,
                       fillStyle: board.ctx.fillStyle,
                       text: document.getElementById("txtText").value,
                       x: board.mouse.text.left+5,
                       y: board.mouse.text.top+5
                   }
               },
               room: rtMan.roomname,
               from: rtMan.username
           });
           document.getElementById("txtText").value=""
           removeBlock("txtText")
        });
        for(var i=0;i<document.getElementsByClassName("txtFontStyle").length;i++) {
            document.getElementsByClassName("txtFontStyle")[i].addEventListener("click",function () {
                board.tools.text.fontStyle = this.getAttribute("data-value");
                document.getElementsByClassName("boardBtnSelected")[0].classList.value = "tools__item tool boardBtn"
                console.log(document.getElementsByClassName("boardBtnSelected")[0])
                this.classList.add('boardBtnSelected');
            });
        }

        document.getElementById("txtFontSize").addEventListener("change",function () {
            board.tools.text.fontSize = this.value;
        });

        window.board = board;

       function handleFileSelect(evt) {
           var files = evt.target.files[0];
           console.log(files)
           board.drawer.loadImage(files)
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
               board.drawer.drawImageRot(board.ctx,image,x,y,w,h,deg)
               rtMan.socket.emit('drawing', {
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
                   room: rtMan.roomname,
                   from: rtMan.username
               });
               document.getElementById("LoadedImage").style.display="none"
               document.getElementById("preloadImg").src=""
            }
           image.src=document.getElementById("preloadImg").src
           document.getElementById("rotation").style.transform="rotate("+0+"deg)"
           angle=0
           board.tool = "pencil";
       })
       document.getElementById("CancelCanvas").addEventListener("click",function(){
           document.getElementById("LoadedImage").style.display="none"
           document.getElementById("preloadImg").src=""
           document.getElementById("rotation").style.transform="rotate("+0+"deg)"
           angle=0
           board.tool = "pencil";
       })
       document.getElementById("saveImage").addEventListener("click",function(){
           var url = board.canvas.toDataURL()
           console.log("картинка")
           console.log(url)
           var img=dataURItoBlob(url)
           console.log(img)

           document.getElementById("ImgSave").href = url;
           document.getElementById("ImgSave").download = "image.png";
           board.tool = "pencil";
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
    };
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
