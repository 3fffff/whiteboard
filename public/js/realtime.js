var tools={
    socket: io(),
    username: null,
    roomname: null,
    visible:true,
}

class rtSocket  {
    static createSocket () {
        var s = window.location.search
        var s1 = s.split("?")
        var spl = s1[1].split("&")
        var params = {}
        if(spl.length===1) {
            console.log("s")
            if(sessionStorage.getItem("name")!==null) {
                params["room"] = s1[1]
                params["name"] = sessionStorage.getItem("name")
                console.log(params)
                rtSocket.join(params)
            }
            else {
                var result = prompt("Введите имя", "Anonymous");
                params["room"] = s1[1]
                params["name"] = result
                sessionStorage.setItem("name",result)
                rtSocket.join(params)
            }
        }
        else {
            for (var i = 0; i < spl.length; i++) {
                var pr = spl[i].split("=")
                params[pr[0]] = pr[1]
            }
            if (params["name"] !== undefined)
                sessionStorage.setItem("name", params["name"])
            window.history.pushState(null, null, "w.html?" + params["room"])
            console.log(params)
            rtSocket.join(params)

        }
        tools.socket.on('drawingRestore', this.restoreDraw);
        tools.socket.on('drawing', this.addData);

    }

    static join (params) {
        tools.socket.emit('join', params, function(err) {
            if (err) {
                alert(err);
            }
            else {
                console.log('ok');
                tools.username = params["room"];
                tools.roomname = params["name"]
                tools.visible = params["name"]
            }
        });
    }

    static restoreDraw(data){
        var image=new Image()
        if(data) {
            boardTools.draw.push(data)
            image.onload = function () {
                board.drawImageRot(boardTools.ctx, image, 0, 0, image.width, image.height, 0)
            }
            image.src = data.boardData.data.src
        }
    }
    static addData(data){
        boardTools.draw.push(data)
        board.transform(boardTools.ctx)
    }
    static broadcastFile(){
        tools.socket.on('base64 file', function(message) {
            console.log(message)
            var type=message.type.split("/")
            var messagesContainer = document.getElementsByClassName('messages')[0];
            if(type[0]==="image")
                messagesContainer.innerHTML+= '<li class="other">'+'<img class="image_chat" width=150 height=150 src=' + message.file + '>'+'</li>'
            else messagesContainer.innerHTML+= '<li class="other">'+ '<a href=' + message.file + '>'+message.fileName+'</a>'+ '</li>'
        });
    }

    static broadcastMessage(){
        tools.socket.on('newMessage', function(message) {
            var messagesContainer = document.getElementsByClassName('messages')[0];

            messagesContainer.innerHTML+= '<li class="other">'+ message.text+'</li>'
            sessionStorage.setItem("messages",messagesContainer.innerHTML)
        });
    }
    static drawFromSocket (dd) {
        if(!dd)
            return

        var initial={}
        initial["lineWidth"] = boardTools.ctx.lineWidth;
        initial["strokeStyle"] = boardTools.ctx.strokeStyle;
        initial["font"] = boardTools.ctx.font;
        var dataDraw=dd.boardData
        if(dataDraw && dataDraw.data) {
            boardTools.ctx.lineWidth = dataDraw.data.lineWidth;
            boardTools.ctx.strokeStyle = dataDraw.data.strokeStyle;
            boardTools.ctx.fillStyle = dataDraw.data.strokeStyle;
            boardTools.ctx.font = dataDraw.data.font || '';
            switch (dataDraw.type) {
                case "recoverImage":
                    var image=new Image()
                    image.onload=function() {
                        board.drawImageRot(boardTools.ctx,image,0,0,image.width,image.height,0)
                    }
                    image.src=dataDraw.data.src
                    break
                case 'image':
                    var image = new Image()
                    image.onload = function () {
                        board.drawImageRot(boardTools.ctx, image, dataDraw.data.points[0].x, dataDraw.data.points[0].y, dataDraw.data.points[0].w, dataDraw.data.points[0].h, dataDraw.data.points[0].deg)
                    }
                    image.src = dataDraw.data.src
                    break;

                case 'line':
                    board.line(boardTools.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                    break;

                case 'rectangle':
                    board.rect(boardTools.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);
                    break;

                case 'ellipse':
                    board.ellipse(boardTools.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);
                    break;

                case 'circle':
                    board.circle(boardTools.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                    break;

                case 'arrow':
                    board.arrow(boardTools.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                    break;

                case 'text':
                    var res=dataDraw.data.text.toString().split("\n")
                    for(let i=0;i<res.length;i++)
                        board.text(boardTools.ctx, res[i], dataDraw.data.x, dataDraw.data.y+i*parseInt(dataDraw.data.size));
                    break;

                case 'pencil':
                    for (i = dataDraw.data.points.length - 2; i >= 0; i--)
                        board.pencil(boardTools.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y);
                    break;

                case 'marker':
                    for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                        board.marker(boardTools.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size, dataDraw.data.strokeStyle);
                    }
                    break;
                case 'eraser':
                    for (i = dataDraw.data.points.length - 1; i >= 0; i--) {
                        boardTools.ctx.beginPath();
                        boardTools.ctx.fillStyle = "white";
                        boardTools.ctx.opacity=0
                        boardTools.ctx.arc(dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.size, 0, 2 * Math.PI);
                        boardTools.ctx.fill();
                    }
                    break;
            }
        }
    }
}