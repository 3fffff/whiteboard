 var c=0
    var rtMan = {

        socket: io(),
        username: null,
        roomname: null,
        visible:true,
        data:[],

        createSocket: function () {
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
                    rtMan.join(params)
                }
                else {
                   var result = prompt("Введите имя", "anonimous");
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
                    rtMan.visible = params["name"]
                }
            });
        },

        restoreDraw:function(data){
          //  console.log("данные восстановления")
           rtMan.data=data
         //   console.log(data)
                rtMan.drawFromSocket(data[0]);
        },
        restoreDrawCall:function(initial){
         //   console.log("вызов")
       //     console.log(rtMan.data)
            rtMan.data.shift()
       //     console.log(rtMan.data[0])
            if(initial!==undefined) {
                board.ctx.strokeStyle = initial.strokeStyle;
                board.ctx.fillStyle = initial.strokeStyle;
                board.ctx.lineWidth = initial.lineWidth;
                board.ctx.font = initial.font;
            }
            rtMan.drawFromSocket(rtMan.data[0]);
        },
        broadcastFile:function(){
            rtMan.socket.on('base64 file', function(message) {
                console.log("получаем base64")
                console.log(message)
                var img=0
                var images=["image/jpeg","image/png","image/gif"]
                var messagesContainer = document.getElementsByClassName('messages')[0];
                for(var i=0;i<images.length;i++) {
                    if(images[i]===message.type) {
                        img=1
                        messagesContainer.innerHTML+= '<li class="other">'+'<img class="image_chat" width=150 height=150 src=' + message.file + '>'+'</li>'
                    }
                }
                if(img==0)
                {
                    messagesContainer.innerHTML+= '<li class="other">'+ '<a width=150 height=150 href=' + message.file + '></a>'+ '</li>'
                }
            });
        },

        broadcastMessage: function(){
        rtMan.socket.on('newMessage', function(message) {

            console.log("получено сообщение ")
            console.log(message)
            var messagesContainer = document.getElementsByClassName('messages')[0];

            messagesContainer.innerHTML+= '<li class="other">'+ message.text+'</li>'
            sessionStorage.setItem("messages",message)
        });
    },
        drawFromSocket: function (dd) {
            if(dd===undefined)
                return
            var keys=Object.keys(dd)
            //  console.log(keys)
            if(keys.length===2)
                rtMan.restoreDrawCall()

              console.log(dd)
            var initial={}
            initial["lineWidth"] = board.ctx.lineWidth;
            initial["strokeStyle"] = board.ctx.strokeStyle;
            initial["font"] = board.ctx.font;
            var dataDraw=dd.boardData
            if(dataDraw!==undefined) {
                board.ctx.lineWidth = dataDraw.data.lineWidth;
                board.ctx.strokeStyle = dataDraw.data.strokeStyle;
                board.ctx.fillStyle = dataDraw.data.strokeStyle;
                board.ctx.font = dataDraw.data.font || '';

                switch (dataDraw.type) {
                    case 'image':
                        var image = new Image()
                        image.onload = function () {
                            board.drawer.drawImageRot(board.ctx, image, dataDraw.data.points[0].x, dataDraw.data.points[0].y, dataDraw.data.points[0].w, dataDraw.data.points[0].h, dataDraw.data.points[0].deg)
                            rtMan.restoreDrawCall(initial)
                        }
                        image.src = dataDraw.data.src
                        break;

                    case 'line':
                        board.drawer.line(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'rectangle':
                        board.drawer.rect(board.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'ellipse':
                        board.drawer.ellipse(board.ctx, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h);
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'circle':
                        board.drawer.circle(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'arrow':
                        board.drawer.arrow(board.ctx, dataDraw.data.x1, dataDraw.data.y1, dataDraw.data.x2, dataDraw.data.y2);
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'text':
                        board.drawer.text(board.ctx, dataDraw.data.text, dataDraw.data.x, dataDraw.data.y);
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'pencil':
                        for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                            board.drawer.pencil(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y);
                        }
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'marker':
                        for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                            board.drawer.marker(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size, dataDraw.data.strokeStyle);
                        }
                        rtMan.restoreDrawCall(initial)
                        break;

                    case 'chalk':
                        for (i = dataDraw.data.points.length - 2; i >= 0; i--) {
                            board.drawer.chalk(board.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.size);
                        }
                        rtMan.restoreDrawCall(initial)
                        break;
                    case 'eraser':
                        for (i = dataDraw.data.points.length - 1; i >= 0; i--) {
                            board.ctx.beginPath();
                            board.ctx.fillStyle = "white";
                            board.ctx.opacity=0
                            board.ctx.arc(dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.size, 0, 2 * Math.PI);
                            board.ctx.fill();
                        }
                        rtMan.restoreDrawCall(initial)
                        break;
                    default:
                        rtMan.restoreDrawCall(initial)
                        break;
                }
            }
           // else rtMan.restoreDrawCall(initial)
        }
    }