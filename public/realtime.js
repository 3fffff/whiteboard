 var c=0
    var rtMan = {

        socket: io(),
        username: null,
        roomname: null,
        loaded:true,

        createSocket: function () {
            var s = window.location.search
            var s1 = s.split("?")
            var spl = s1[1].split("&")
            var params = {}
            if(spl.length==1) {
                console.log("s")
                if(sessionStorage.getItem("name")!==null) {
                    params["room"] = s1[1]
                    params["name"] = sessionStorage.getItem("name")
                    console.log(params)
                    rtMan.join(params)
                }
                else {
                    result = prompt("Введите имя", "anonimous");
                    params["room"] = s1[1]
                    params["name"] = result
                    sessionStorage.setItem("name",result)
                    rtMan.join(params)
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
                rtMan.join(params)
            }

            rtMan.socket.on('drawingRestore', rtMan.restoreDraw);
            rtMan.socket.on('drawing', rtMan.drawFromSocket);
        },

        join:function (params) {
        rtMan.socket.emit('join', params, function(err) {
                if (err) {
                    alert(err);
                }
                else {
                    console.log('ok');
                    rtMan.username = params["room"];
                    rtMan.roomname = params["name"]
                }
            });
        },

        restoreDraw:function(data){
            console.log("данные восстановления")
            console.log(data)
            for(var i=0;i<data.length;i++) {
                rtMan.drawFromSocket(data[i]);
            }
        },
        broadcastFile:function(){
            rtMan.socket.on('base64 file', function(message) {
                console.log("получаем base64")
                console.log(message)
                var img=0
                var images=["image/jpeg","image/png","image/gif"]
                var messagesContainer = $('.messages');
                for(var i=0;i<images.length;i++) {
                    if(images[i]===message.type) {
                        img=1
                        messagesContainer.append([
                            '<li class="other">',
                            '<img class="image_chat" width=150 height=150 src=' + message.file + '>',
                            '</li>'
                        ].join(''));
                    }
                }
                if(img==0)
                {
                    messagesContainer.append([
                        '<li class="other">',
                        '<a width=150 height=150 href=' + message.file + '></a>',
                        '</li>'
                    ].join(''));
                }
            });
        },

        broadcastMessage: function(){
        rtMan.socket.on('newMessage', function(message) {

            console.log("получено сообщение ")
            console.log(message)
            var messagesContainer = $('.messages');

            messagesContainer.append([
                '<li class="other">',
                message.text,
                '</li>'
            ].join(''));
            sessionStorage.setItem("messages",message)
        });
    },

    drawFromSocket: function (dd) {
            var keys=Object.keys(dd)
        console.log(keys)
        if(keys.length==2) {
            console.log("boarddata")
            return
        }
        console.log(dd)
        var dataDraw=dd.boardData
        board.ctx.lineWidth = dataDraw.data.lineWidth;
        board.ctx.strokeStyle = dataDraw.data.strokeStyle;
        board.ctx.fillStyle = dataDraw.data.strokeStyle;
            switch (dataDraw.type) {
                case 'image':
                    var image = new Image()
                    this.loaded=false
                    image.onload = function () {

                        setTimeout(function(){
                            this.loaded=true
                            board.drawer.drawImageRot(board.ctx, image, dataDraw.data.points[0].x, dataDraw.data.points[0].y, dataDraw.data.points[0].w, dataDraw.data.points[0].h, dataDraw.data.points[0].deg)},15)
                    }
                    image.src = dataDraw.data.src
                    break;

            case 'line':
                if(this.loaded==true)
                    board.drawer.line(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                else
                    setTimeout(function(){board.drawer.line(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2)},15);
                break;

            case 'rectangle':
                if(this.loaded==true)
                    board.drawer.rect(board.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);
                else
                    setTimeout(function(){board.drawer.rect(board.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);},17);
                break;

            case 'ellipse':
                if(this.loaded==true)
                    board.drawer.ellipse(board.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);
                else setTimeout(function(){board.drawer.ellipse(board.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);},15);
                break;

            case 'circle':
                if(this.loaded==true)
                    board.drawer.circle(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                else setTimeout(function(){board.drawer.circle(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);},15);
                break;

            case 'arrow':
                if(this.loaded==true)
                    board.drawer.arrow(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                else setTimeout(function(){board.drawer.arrow(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);},15);
                break;

            case 'text':
                if(this.loaded==true)
                    board.drawer.text(board.ctx, dataDraw.data.text, dataDraw.data.x, dataDraw.data.y);
                else setTimeout(function(){board.drawer.text(board.ctx, dataDraw.data.text, dataDraw.data.x, dataDraw.data.y);},15);
                break;

            case 'pencil':
                if(this.loaded==true) {
                    for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                        board.drawer.pencil(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y);
                    }
                }
                else {
                    setTimeout(function(){
                        for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                            board.drawer.pencil(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y);
                        }
                        },15);
                }
                break;

            case 'marker':
                if(this.loaded==true) {
                    for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                        board.drawer.marker(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size, dataDraw.data.strokeStyle);
                    }
                }
                else {
                    setTimeout(function(){
                        for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                            board.drawer.marker(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size, dataDraw.data.strokeStyle);
                        }
                    },15);
                }
                break;

            case 'chalk':
                if(this.loaded==true) {
                    for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                        board.drawer.chalk(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size);
                    }
                }
                else {
                    setTimeout(function(){
                        for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                            board.drawer.chalk(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size);
                        }
                    },15);
                }
                break;
            case 'eraser':
                if(this.loaded==true) {
                    for (i = dataDraw.data.points.length - 1; i >= 0; i--) {
                        board.ctx.beginPath();
                        board.ctx.fillStyle = "white";
                        board.ctx.arc(dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.size, 0, 2 * Math.PI);
                        board.ctx.fill();
                    }
                }
                else {
                    setTimeout(function(){
                        for (i = dataDraw.data.points.length - 1; i >= 0; i--) {
                            board.ctx.beginPath();
                            board.ctx.fillStyle = "white";
                            board.ctx.arc(dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.size, 0, 2 * Math.PI);
                            board.ctx.fill();
                        }
                    },15);
                }
                break;
            default:
                break;
            }
            board.ctx.strokeStyle = initialStrokeStyle;
            board.ctx.fillStyle = initialStrokeStyle;
            board.ctx.lineWidth = initialLineWidth;
            board.ctx.font = initialFont;
        }
    }