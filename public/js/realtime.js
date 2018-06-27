var tools = {
	socket: io({
		'reconnection': true,
		'reconnectionDelay': 5000,
		'reconnectionAttempts': 'Infinity'
	}),
	username: null,
	roomname: null,
	visible: true
}

class rtSocket {
	static createSocket() {
		var s = window.location.search
		var s1 = s.split("?")
		var spl = s1[1].split("&")
		var params = {}
		console.log(s1)
		var room = decodeURI(s1[1]).replace(/[^A-Za-zА-Яа-яЁё0-9_]/g, "")
		if (spl.length === 1) {
			console.log("s")
			if (sessionStorage.getItem("name") !== null) {
				params["room"] = room
				params["name"] = sessionStorage.getItem("name")
				console.log(params)
				if (sessionStorage.getItem("messages"))
					document.getElementsByClassName('messages')[0].innerHTML = sessionStorage.getItem("messages")
				rtSocket.join(params)
			} else {
				var result = "Anonymous"
				params["room"] = room
				params["name"] = result
				document.getElementsByClassName("dm-overlay")[0].style.display = "block"
				sessionStorage.setItem("name", result)
				rtSocket.join(params)
			}
		} else {
			for (var i = 0; i < spl.length; i++) {
				var pr = spl[i].split("=")
				var prr = decodeURI(pr[1]).split("%")
				params[pr[0]] = prr[0].replace(/[^A-Za-zА-Яа-яЁё0-9]/g, "")
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

	static join(params) {
		tools.socket.emit('join', params, function (err) {
			if (err) {
				alert(err);
				window.location.href = "/"
			} else {
				console.log('ok');
				console.log(params)
				tools.username = params["room"];
				tools.roomname = params["name"]
				tools.visible = params["name"]
			}
		});
	}
	static reconnect() {

	}

	static restoreCall(data) {
		if (data && data.length !== 0) {
			if (data[0].boardData.type !== "image") {
				boardTools.draw.push(data[0])
				data.shift()
				rtSocket.restoreDraw(data)
			} else {
				let img = new Image()
				img.onload = function () {
					data[0].boardData.data.src = img
					boardTools.draw.push(data[0])
					data.shift()
					rtSocket.restoreDraw(data)
				}
				img.src = data[0].boardData.data.src
			}
		} else board.transform(boardTools.ctx)
	}

	static restoreDraw(data) {
		if (data && data.length === 0) {
			board.transform(boardTools.ctx)
			return
		}
		rtSocket.restoreCall(data)
	}

	static restoreImage(data) {
		var img = new Image()
		img.onload = function () {
			data.boardData.data.src = img
			boardTools.draw.push(data)
			board.transform(boardTools.ctx)
		}
		if (data)
			img.src = data.boardData.data.src
	}
	static addData(data) {
		if (data.boardData.type !== "image") {
			boardTools.draw.push(data)
			board.transform(boardTools.ctx)
		} else rtSocket.restoreImage(data)
	}
	static broadcastFile() {
		tools.socket.on('base64 file', function (message) {
			var type = message.type.split("/")
			var messagesContainer = document.getElementsByClassName('messages')[0];
			if (type[0] === "image")
				messagesContainer.innerHTML += '<li class="other">' + '<img class="image_chat" width=150 height=150 src=' + message.file + '>' + '</li>'
			else messagesContainer.innerHTML += '<li class="other">' + '<a download href=' + message.file + '>' + message.fileName + '</a>' + '</li>'
			sessionStorage.setItem("messages", messagesContainer.innerHTML)
			var other = document.getElementsByClassName('other')
			other[other.length - 1].scrollIntoView();
		});
	}

	static broadcastMessage() {
		tools.socket.on('newMessage', function (message) {
			var messagesContainer = document.getElementsByClassName('messages')[0];
			messagesContainer.innerHTML += '<li class="other">' + message.text + '</li>'
			sessionStorage.setItem("messages", messagesContainer.innerHTML)
			var other = document.getElementsByClassName('other')
			other[other.length - 1].scrollIntoView();
		});
	}
	static drawFromSocket(dd) {
		if (!dd)
			return
		var dataDraw = dd.boardData
		if (dataDraw && dataDraw.data) {
			boardTools.ctx.lineWidth = dataDraw.data.lineWidth;
			boardTools.ctx.strokeStyle = dataDraw.data.strokeStyle;
			boardTools.ctx.fillStyle = dataDraw.data.strokeStyle;
			boardTools.ctx.font = dataDraw.data.font || '';
			switch (dataDraw.type) {
				case 'image':
					board.drawImageRot(boardTools.ctx, dataDraw.data.src, dataDraw.data.x, dataDraw.data.y, dataDraw.data.w, dataDraw.data.h, dataDraw.data.deg)
					break;
				case 'line':
					board.line(boardTools.ctx, dataDraw.data.p1, dataDraw.data.p2, dataDraw.data.p3, dataDraw.data.p4)
					break;
				case 'rectangle':
					board.rect(boardTools.ctx, dataDraw.data.p1, dataDraw.data.p2, dataDraw.data.p3, dataDraw.data.p4);
					break;
				case 'ellipse':
					board.ellipse(boardTools.ctx, dataDraw.data.p1, dataDraw.data.p2, dataDraw.data.p3, dataDraw.data.p4);
					break;
				case 'circle':
					board.circle(boardTools.ctx, dataDraw.data.p1, dataDraw.data.p2, dataDraw.data.p3);
					break;
				case 'arrow':
					board.arrow(boardTools.ctx, dataDraw.data.p1, dataDraw.data.p2, dataDraw.data.p3, dataDraw.data.p4);
					break;
				case 'text':
					var res = dataDraw.data.text.toString().split("\n")
					for (let i = 0; i < res.length; i++)
						board.text(boardTools.ctx, res[i], dataDraw.data.x, dataDraw.data.y + i * parseInt(dataDraw.data.size));
					break;
				case 'pencil':
					for (let i = dataDraw.data.points.length - 2; i >= 0; i--)
						board.pencil(boardTools.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y);
					break;
				case 'marker':
					for (let i = dataDraw.data.points.length - 2; i >= 0; i--)
						board.marker(boardTools.ctx, dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.points[i + 1].x, dataDraw.data.points[i + 1].y, dataDraw.data.lineWidth, dataDraw.data.strokeStyle);
					break;
				case 'eraser':
					for (let i = dataDraw.data.points.length - 1; i >= 0; i--) {
						boardTools.ctx.beginPath();
						boardTools.ctx.fillStyle = "white";
						boardTools.ctx.arc(dataDraw.data.points[i].x, dataDraw.data.points[i].y, dataDraw.data.lineWidth * 10, 0, 2 * Math.PI);
						boardTools.ctx.fill();
					}
					break;
			}
		}
	}
}
document.getElementsByClassName("close")[0].addEventListener("click", function () {
	document.getElementsByClassName("dm-overlay")[0].style.display = "none"
})
document.getElementById("ready").addEventListener("click", function () {
	document.getElementsByClassName("dm-overlay")[0].style.display = "none"
	if (document.getElementById("name").value !== "") {
		sessionStorage.setItem("name", document.getElementById("name").value)
		tools.socket.emit('updateUser', document.getElementById("name").value);
	}
})
tools.socket.on('connect', () => {
	console.log("подключились")
});
tools.socket.on('disconnect', (reason) => {
	console.log(reason)
	tools.socket.reconnection
	tools.socket.connect();
});
tools.socket.on('reconnect', (attemptNumber) => {
	tools.socket.connect();
	console.log("reconnect")
});
tools.socket.on('reconnect_failed', () => {
	console.log("reconnect_failed")

});
tools.socket.on('reconnecting', (attemptNumber) => {
	tools.socket.connect();
});
window.onfocus = function () {
	rtSocket.join({
		"room": tools.roomname,
		"name": tools.username,
	})
}
rtSocket.createSocket()
rtSocket.broadcastFile()
rtSocket.broadcastMessage()
document.getElementById("canvas").width = document.body.clientWidth
document.getElementById("canvas").height = document.body.clientHeight
