var boardTools = {
	mouse: {
		mouseDown: false,
		pos: {
			initial: {
				x: 0,
				y: 0
			},
			final: {
				x: 0,
				y: 0
			}
		},
		offsetFinish: {
			x: 0,
			y: 0
		},
		offsetInitial: {
			x: 0,
			y: 0
		}
	},
	dSnap: 10,
	touchDown: false,
	canvas: document.getElementById("canvas"),
	ctx: document.getElementById("canvas").getContext('2d'),
	offset: {
		x: 0,
		y: 0
	},
	tool: 'pencil',
	draw: [],
	last: {},
	dragStart: null,
	dragged: false,
	scale: 1.0,
	posScaleI: {
		sx: 0,
		sy: 0
	},
	text: {
		top: 0,
		left: 0
	},
	scroll: false
}
class board {
	static trackMouse(e) {
		boardTools.offset.x = (e.sx - boardTools.posScaleI.sx) * boardTools.scale
		boardTools.offset.y = (e.sy - boardTools.posScaleI.sy) * boardTools.scale
		boardTools.mouse.offsetInitial.x = boardTools.offset.x
		boardTools.mouse.offsetInitial.y = boardTools.offset.y
	}

	static transform(ctx) {
		ctx.clearRect(0, 0, boardTools.canvas.clientWidth, boardTools.canvas.clientHeight);

		ctx.save();

		ctx.translate(boardTools.canvas.clientWidth / 2 + boardTools.offset.x, boardTools.canvas.clientHeight / 2 + boardTools.offset.y);
		ctx.scale(boardTools.scale, boardTools.scale);
		for (var i = 0; i < boardTools.draw.length; i++)
			rtSocket.drawFromSocket(boardTools.draw[i])
		ctx.restore();
	}

	static snap(x) {
		return Math.floor((x + 0.5) / boardTools.dSnap) * boardTools.dSnap;
	}

	static grid(ctx) {
		const xmin = -boardTools.canvas.clientWidth * boardTools.scale / 2;
		const xmax = boardTools.canvas.clientWidth * boardTools.scale + xmin;
		const ymin = -boardTools.canvas.clientHeight * boardTools.scale / 2;
		const ymax = boardTools.canvas.clientHeight * boardTools.scale + ymin;
		const xToCoord = function (x) { return (x - xmin) / (xmax - xmin) * boardTools.canvas.clientWidth };
		const yToCoord = function (y) { return (y - ymin) / (ymax - ymin) * boardTools.canvas.clientHeight };
		ctx.strokeStyle = "rgba(160, 160, 255, .5)";
		const xstart = Math.floor(xmin / boardTools.dSnap) * boardTools.dSnap;
		for (let x = xstart; x < xmax; x += boardTools.dSnap * boardTools.scale) {
			ctx.moveTo(xToCoord(x), yToCoord(ymin));
			ctx.lineTo(xToCoord(x), yToCoord(ymax));

		}
		const ystart = Math.floor(ymin / boardTools.dSnap) * boardTools.dSnap;
		for (let y = ystart; y < ymax; y += boardTools.dSnap * boardTools.scale) {
			ctx.moveTo(xToCoord(xmin), yToCoord(y));
			ctx.lineTo(xToCoord(xmax), yToCoord(y));
		}
		ctx.stroke();
	}

	static MousePosScale(canvas, e) {
		var rect = canvas.getBoundingClientRect();
		var x = 0,
			y = 0
		if ((e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') && e.changedTouches.length === 1) {
			x = e.changedTouches[0].clientX - rect.left;
			y = e.changedTouches[0].clientY - rect.top;
		} else {
			x = e.clientX - rect.left;
			y = e.clientY - rect.top;
		}
		var sx = (x - boardTools.canvas.clientWidth / 2) / boardTools.scale;
		var sy = (y - boardTools.canvas.clientHeight / 2) / boardTools.scale;
		return {
			sx: sx,
			sy: sy
		};
	}
	static shapeSVG(stroke) {
		var xmlns = "http://www.w3.org/2000/svg";
		var svg = document.createElementNS(xmlns, "svg");
		svg.id = "dop"
		svg.style.width = document.body.clientWidth
		svg.style.height = document.body.clientHeight
		svg.innerHTML += "  <" + stroke + " style=\"fill:rgba(152,255,226,0.5);stroke-width:3;stroke:#00efff\" />\n"
		document.body.appendChild(svg)
	}
	static pencil(ctx, x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}
	static marker(context, x1, y1, x2, y2, size, color) {
		context.globalAlpha = 0.3;
		context.lineWidth = size * 3;
		context.strokeStyle = color;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();

		context.globalAlpha = 1;
		context.lineWidth = size;
	}
	static text(context, text, x, y) {
		context.fillText(text, x, y);
	}

	static loadImage(data) {
		document.getElementById("LoadedImage").style.display = "block"
		var preload = document.getElementById("preloadImg")
		var drop = document.getElementsByClassName("drop")[0]
		var reader = new FileReader();
		reader.onload = function (evt) {
			var pic = new Image();
			pic.src = evt.target.result;
			pic.onload = function () {
				if (document.body.clientWidth < 768 || document.body.clientWidth < 768) {
					var resx = 20 * this.width / document.body.clientWidth
					var resy = 20 * this.height / document.body.clientWidth
					var x = (document.body.clientWidth - resx) / 2
					var y = (document.body.clientHeight - resy) / 2
					preload.style.height = resy + "px"
					preload.style.width = resx + "px"
					drop.style.left = x + "px"
					drop.style.top = y + "px"
				} else {
					var x = (document.body.clientWidth - this.width / 2) / 2
					var y = (document.body.clientHeight - this.height / 2) / 2
					preload.style.height = this.height * 0.4 + "px"
					preload.style.width = this.width * 0.4 + "px"
					drop.style.left = x + "px"
					drop.style.top = y + "px"
				}
			}
			preload.src = evt.target.result
		};
		if (data)
			reader.readAsDataURL(data);
	}

	static drawImageRot(ctx, img, x, y, width, height, deg) {
		var rad = deg * Math.PI / 180;
		ctx.translate(((x) + width / 2), ((y) + height / 2));
		ctx.rotate(rad);
		ctx.drawImage(img, (((width / 2)) * (-1)), (((height / 2)) * (-1)), (width), (height));
		ctx.rotate(rad * (-1));
		ctx.translate(((x) + width / 2) * (-1), ((y) + height / 2) * (-1));
	}

	static rect(ctx, x, y, w, h) {
		ctx.strokeRect(x, y, w, h);
	}

	static circle(ctx, x, y, r) {
		ctx.beginPath();
		ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
		ctx.stroke();
	}

	static ellipse(ctx, x, y, w, h) {
		ctx.beginPath();
		ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI);
		ctx.stroke();
	}

	static line(ctx, x1, y1, x2, y2) {
		console.log(x2)
		x1 = board.snap(x1)
		x2 = board.snap(x2)
		y1 = board.snap(y1)
		y2 = board.snap(y2)
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}
	static arrow(ctx, x1, y1, x2, y2) {
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
	static eraser(ctx) {
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.strokeStyle = "white"
		ctx.arc(boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.ctx.lineWidth * 10, 0, 2 * Math.PI);
		ctx.fill();
		ctx.fillStyle = document.getElementById("pickColor").style.backgroundColor
		ctx.strokeStyle = document.getElementById("pickColor").style.backgroundColor
	}
	static sendToSocketShape(type, p1, p2, p3, p4) {
		boardTools.last = {
			type: type,
			data: {
				lineWidth: boardTools.ctx.lineWidth,
				strokeStyle: boardTools.ctx.strokeStyle,
				p1: p1,
				p2: p2,
				p3: p3,
				p4: p4
			}
		}
	}

	static sendToSocketPoints(type, x, y) {
		boardTools.last = {
			type: type,
			data: {
				strokeStyle: boardTools.ctx.strokeStyle,
				lineWidth: boardTools.ctx.lineWidth,
				points: [{
					x: x,
					y: y
				}]
			}
		}
	}

	static changeTool(t) {
		boardTools.dragged = false
		removeBlock("txtText")
		boardTools.canvas.classList.remove("grab")
		boardTools.canvas.style.cursor = "crosshair"
		document.getElementById("txtFontSize").style.display = "none"
		boardTools.tool = t;
	}

	static changeColor(color) {
		boardTools.ctx.strokeStyle = color;
		boardTools.ctx.fillStyle = color;
	}

	static changeSize(size) {
		boardTools.ctx.lineWidth = size;
	}
}

function drawStart(e) {
	removeBlockClass("fadeInLeft")
	if (e.type === 'mousedown') boardTools.mouse.mouseDown = true;
	if (e.type === 'touchstart') boardTools.touchDown = true;
	if (boardTools.mouse.mouseDown) {
		boardTools.mouse.pos.initial.x = e.clientX
		boardTools.mouse.pos.initial.y = e.clientY
	} else {
		e.preventDefault()
		boardTools.mouse.pos.initial.x = e.touches[0].clientX
		boardTools.mouse.pos.initial.y = e.touches[0].clientY
	}
	boardTools.posScaleI = board.MousePosScale(boardTools.canvas, e)
	if (!boardTools.dragged) {
		switch (boardTools.tool) {
			case 'text':
				boardTools.mouse.mouseDown = false
				if (document.getElementById("txtText") !== null) textInsert()
				var textarea = document.createElement("textarea");
				textarea.id = "txtText"
				textarea.placeholder = "введите текст"
				document.body.appendChild(textarea)
				var text = document.getElementById("txtFontSize")
				var txtT = document.getElementById("txtText")
				txtT.style.left = boardTools.mouse.pos.initial.x + "px"
				txtT.style.top = boardTools.mouse.pos.initial.y + "px"
				txtT.style.fontSize = text.value
				txtT.style.fontFamily = "Arial"
				txtT.style.color = boardTools.ctx.strokeStyle
				var x = boardTools.canvas.clientWidth - boardTools.mouse.pos.initial.x - 15
				var y = boardTools.canvas.clientHeight - boardTools.mouse.pos.initial.y - 15
				txtT.style.width = x + "px"
				txtT.style.height = y + "px"
				boardTools.text.top = boardTools.mouse.pos.initial.y;
				boardTools.text.left = boardTools.mouse.pos.initial.x;
				txtT.addEventListener("click", textInsert)
				text.style.display = "block"
				text.style.marginLeft = (boardTools.mouse.pos.initial.x - 15) + "px"
				text.style.marginTop = (boardTools.mouse.pos.initial.y - 40) + "px"
				setTimeout(function () {
					txtT.focus()
				}, 50)
				break
			case 'pencil':
				board.sendToSocketPoints("pencil", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale)
				break
			case 'marker':
				board.sendToSocketPoints("marker", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale)
				break
			case 'eraser':
				board.sendToSocketPoints("eraser", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale)
				break
		}
	} else {
		boardTools.canvas.classList.remove("grab")
		boardTools.canvas.classList.add("grabbing")
	}
}

function drawEnd(e) {
	board.grid(boardTools.ctx)
	boardTools.mouse.mouseDown = false;
	boardTools.touchDown = false;
	e.preventDefault()
	var posScale = board.MousePosScale(boardTools.canvas, e)
	if (!boardTools.dragged) {
		removeBlock("dop")
		if ((e.type === "mouseup") || (boardTools.mouse.pos.final.x !== null && boardTools.mouse.pos.final.y !== null && !boardTools.scroll)) {
			if (!boardTools.mouse.pos.initial.x || !boardTools.mouse.pos.initial.y || !boardTools.mouse.pos.final.x || !boardTools.mouse.pos.final.y) return
			switch (boardTools.tool) {
				case 'line':
					board.line(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
					board.sendToSocketShape("line", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale, posScale.sx - (boardTools.offset.x) / boardTools.scale, posScale.sy - (boardTools.offset.y) / boardTools.scale)
					break
				case 'rectangle':
					board.rect(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x, boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y);
					board.sendToSocketShape("rectangle", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale, posScale.sx - boardTools.posScaleI.sx, posScale.sy - boardTools.posScaleI.sy)
					break
				case 'circle':
					var rx = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
					var ry = (boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y) / 2
					board.circle(boardTools.ctx, boardTools.mouse.pos.initial.x + rx, boardTools.mouse.pos.initial.y + ry, Math.abs(rx));
					board.sendToSocketShape("circle", boardTools.posScaleI.sx + rx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy + ry - (boardTools.offset.y) / boardTools.scale, Math.abs(rx), null)
					break
				case 'ellipse':
					board.ellipse(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x, boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y);
					board.sendToSocketShape("ellipse", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale, posScale.sx - boardTools.posScaleI.sx, posScale.sy - boardTools.posScaleI.sy)
					break
				case 'arrow':
					board.arrow(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
					board.sendToSocketShape("arrow", boardTools.posScaleI.sx - (boardTools.offset.x) / boardTools.scale, boardTools.posScaleI.sy - (boardTools.offset.y) / boardTools.scale, posScale.sx - (boardTools.offset.x) / boardTools.scale, posScale.sy - (boardTools.offset.y) / boardTools.scale)
					break
			}
			if (Object.keys(boardTools.last).length !== 0) {
				var result = {
					boardData: boardTools.last,
					room: tools.roomname,
					from: tools.username,
				}
				tools.socket.emit('drawing', result);
				boardTools.draw.push(result)
				boardTools.mouse.pos.final.x = null
				boardTools.mouse.pos.final.y = null
			}
		}
	} else {
		boardTools.mouse.offsetFinish.x = boardTools.mouse.offsetInitial.x
		boardTools.mouse.offsetFinish.y = boardTools.mouse.offsetInitial.y
		boardTools.canvas.classList.remove("grabbing")
		boardTools.canvas.classList.add("grab")
	}
}

function drawRealT(e) {
	if (boardTools.mouse.mouseDown) {
		boardTools.mouse.pos.final.x = e.clientX
		boardTools.mouse.pos.final.y = e.clientY
	} else if (boardTools.touchDown) {
		e.preventDefault()
		boardTools.mouse.pos.final.x = e.touches[0].clientX
		boardTools.mouse.pos.final.y = e.touches[0].clientY
	}
	var posScale = board.MousePosScale(boardTools.canvas, e)
	if (boardTools.mouse.mouseDown || (boardTools.touchDown && e.touches.length === 1)) {
		if (boardTools.dragged) {
			var er
			if (boardTools.mouse.mouseDown)
				er = {
					"clientX": e.clientX + (boardTools.mouse.offsetFinish.x),
					"clientY": e.clientY + (boardTools.mouse.offsetFinish.y)
				}
			else if (boardTools.touchDown) er = {
				"clientX": e.touches[0].clientX + (boardTools.mouse.offsetFinish.x),
				"clientY": e.touches[0].clientY + (boardTools.mouse.offsetFinish.y)
			}
			var posScaleDrag = board.MousePosScale(boardTools.canvas, er)
			board.trackMouse(posScaleDrag)
			board.transform(boardTools.ctx)
		} else {
			removeBlock("dop")
			boardTools.scroll = false
			switch (boardTools.tool) {
				case 'pencil':
					board.pencil(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y);
					boardTools.last.data.points.push({
						x: posScale.sx - (boardTools.offset.x) / boardTools.scale,
						y: posScale.sy - (boardTools.offset.y) / boardTools.scale
					});
					boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
					boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
					break
				case 'marker':
					board.marker(boardTools.ctx, boardTools.mouse.pos.initial.x, boardTools.mouse.pos.initial.y, boardTools.mouse.pos.final.x, boardTools.mouse.pos.final.y, boardTools.ctx.lineWidth, boardTools.ctx.fillStyle);
					boardTools.last.data.points.push({
						x: posScale.sx - (boardTools.mouse.offsetInitial.x) / boardTools.scale,
						y: posScale.sy - (boardTools.mouse.offsetInitial.y) / boardTools.scale
					});
					boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
					boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
					break
				case 'rectangle':
					var x = boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x
					var y = boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y
					if (x > 0 && y > 0)
						board.shapeSVG("rect x=" + boardTools.mouse.pos.initial.x + " y=" + boardTools.mouse.pos.initial.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
					else if (x < 0 && y < 0)
						board.shapeSVG("rect x=" + boardTools.mouse.pos.final.x + " y=" + boardTools.mouse.pos.final.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
					else if (x > 0 && y < 0)
						board.shapeSVG("rect x=" + boardTools.mouse.pos.initial.x + " y=" + boardTools.mouse.pos.final.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
					else if (x < 0 && y > 0)
						board.shapeSVG("rect x=" + boardTools.mouse.pos.final.x + " y=" + boardTools.mouse.pos.initial.y + " width=" + Math.abs(x) + " height=" + Math.abs(y))
					break
				case 'ellipse':
					var w = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
					var h = (boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y) / 2
					var x = boardTools.mouse.pos.initial.x + w
					var y = boardTools.mouse.pos.initial.y + h
					board.shapeSVG("ellipse cx=" + x + " cy=" + y + " rx=" + Math.abs(w) + " ry=" + Math.abs(h))
					break
				case "circle":
					var rx = (boardTools.mouse.pos.final.x - boardTools.mouse.pos.initial.x) / 2
					var ry = (boardTools.mouse.pos.final.y - boardTools.mouse.pos.initial.y) / 2
					var x = boardTools.mouse.pos.initial.x + rx
					var y = boardTools.mouse.pos.initial.y + ry
					board.shapeSVG("circle cx=" + x + " cy=" + y + " r=" + Math.abs(rx))
					break
				case 'arrow':
					board.shapeSVG("line x1=" + boardTools.mouse.pos.initial.x + " y1=" + boardTools.mouse.pos.initial.y + " x2=" + boardTools.mouse.pos.final.x + " y2=" + boardTools.mouse.pos.final.y)
					break
				case 'line':
					board.shapeSVG("line x1=" + boardTools.mouse.pos.initial.x + " y1=" + boardTools.mouse.pos.initial.y + " x2=" + boardTools.mouse.pos.final.x + " y2=" + boardTools.mouse.pos.final.y)
					break
				case 'eraser':
					board.eraser(boardTools.ctx);
					boardTools.last.data.points.push({
						x: posScale.sx - (boardTools.mouse.offsetInitial.x) / boardTools.scale,
						y: posScale.sy - (boardTools.mouse.offsetInitial.y) / boardTools.scale
					});
					boardTools.mouse.pos.initial.x = boardTools.mouse.pos.final.x;
					boardTools.mouse.pos.initial.y = boardTools.mouse.pos.final.y;
					break
			}
		}
	}
}

function removeBlock(del) {
	if (document.getElementById(del) !== null)
		document.getElementById(del).parentNode.removeChild(document.getElementById(del))
}

function removeBlockClass(del) {
	for (var i = 0; i < document.getElementsByClassName(del).length; i++) {
		if (document.getElementsByClassName(del)[i] !== null)
			document.getElementsByClassName(del)[i].className = "toolbox fadeInLeft"
	}
}

function textInsert() {
	boardTools.ctx.fillStyle = document.getElementsByClassName("picked__color")[0].style.backgroundColor
	var txt = document.getElementById("txtText")
	if (txt.value !== "") {
		var size = parseInt(document.getElementById("txtText").style.fontSize)
		var r = txt.value.toString().split("\n")
		boardTools.ctx.font = "normal " + size + "px Arial";
		for (let i = 0; i < r.length; i++)
			board.text(boardTools.ctx, r[i], boardTools.text.left, boardTools.text.top + size + i * size);
		var e = {
			clientX: boardTools.text.left,
			clientY: boardTools.text.top + size
		}
		var er = board.MousePosScale(boardTools.canvas, e)
		var res = {
			boardData: {
				type: 'text',
				data: {
					size: size,
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
		tools.socket.emit('drawing', res);
		boardTools.draw.push(res)
	}
	removeBlock("txtText")
	document.getElementById("txtFontSize").style.display = "none"
}

document.getElementById("ImgLoadCanvas").addEventListener("click", function () {
	var x = document.getElementsByClassName("drop")[0].style.left
	x = parseInt(x.substr(0, x.length - 2))
	var y = document.getElementsByClassName("drop")[0].style.top
	var d = document.getElementById("rotation").style.transform
	y = parseInt(y.substr(0, y.length - 2))
	var de = d.split("(")
	var deg = parseFloat(de[1].substr(0, de[1].length - 4))
	var h = document.getElementById("preloadImg").style.height
	h = parseInt(h.substr(0, h.length - 2))
	var w = document.getElementById("preloadImg").style.width
	w = parseInt(w.substr(0, w.length - 2))
	var image = new Image()
	image.onload = function () {
		var e = {
			clientX: x,
			clientY: y
		}
		var er = board.MousePosScale(boardTools.canvas, e)
		board.drawImageRot(boardTools.ctx, image, x, y, w, h, deg)
		let res = {
			boardData: {
				type: "image",
				data: {
					src: image.src,
					x: er.sx - (boardTools.offset.x / boardTools.scale),
					y: er.sy - (boardTools.offset.y / boardTools.scale),
					w: w / boardTools.scale,
					h: h / boardTools.scale,
					deg: deg
				}
			},
			room: tools.roomname,
			from: tools.username
		}
		tools.socket.emit('drawing', res);
		res.boardData.data.src = image
		boardTools.draw.push(res)
	}
	image.src = document.getElementById("preloadImg").src
	document.getElementById("rotation").style.transform = "rotate(" + 0 + "deg)"
	angle = 0
	document.getElementById("LoadedImage").style.display = "none"
	document.getElementById("preloadImg").src = ""
	boardTools.tool = "pencil";
})

var active = false,
	center = {
		x: 0,
		y: 0
	},
	rotation = 0,
	startAngle = 0,
	moveImg = false,
	posMove = {
		x: 0,
		y: 0
	},
	changeS = {
		x: 0,
		y: 0
	},
	resizeImg = false,
	angle = 0,
	chanL = 0,
	partX, partY

function start(e) {
	var ref = document.getElementsByClassName("drop")[0].getBoundingClientRect()
	center = {
		x: ref.left + (ref.width / 2),
		y: ref.top + (ref.height / 2)
	};
	if (e.type === "touchmove" || e.type === "touchstart" || e.type === "touchend") {
		x = e.touches[0].clientX - center.x;
		y = e.touches[0].clientY - center.y;
	} else {
		x = e.clientX - center.x;
		y = e.clientY - center.y;
	}
	startAngle = (180 / Math.PI) * Math.atan2(y, x);
	active = true;
}

function rotate(e) {
	var x = e.clientX - center.x;
	var y = e.clientY - center.y;
	if (e.type === "touchmove" || e.type === "touchstart" || e.type === "touchend") {
		x = e.touches[0].clientX - center.x;
		y = e.touches[0].clientY - center.y;
	} else {
		x = e.clientX - center.x;
		y = e.clientY - center.y;
	}
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
	if (active)
		angle += rotation;
	moveImg = false
	active = false
	resizeImg = false
};

function StartSize() {
	var refDrop = document.getElementsByClassName("drop")[0].getBoundingClientRect()
	var ref = this.getBoundingClientRect()
	partX = ref.x - refDrop.x
	partY = ref.y - refDrop.y
	changeS = {
		x: ref.x,
		y: ref.y
	}
	resizeImg = true
}

function sizeChange(e) {
	var k = 10
	var x = 0
	if (e.type === "touchmove" || e.type === "touchstart" || e.type === "touchend")
		x = e.touches[0].clientX - changeS.x
	else x = e.clientX - changeS.x
	var x1 = x - chanL
	var preload = document.getElementById("preloadImg")
	var prevw = preload.style.width
	prevw = parseFloat(prevw.substr(0, prevw.length - 2))
	var prevh = preload.style.height
	prevh = parseFloat(prevh.substr(0, prevh.length - 2))
	var scale = parseFloat(prevh / prevw)
	if ((partX < 0 && x1 > 0) || (partX > 0 && x1 < 0)) {
		prevh -= k * scale
		prevw -= k
	} else if ((partX < 0 && x1 < 0) || (partX > 0 && x1 > 0)) {
		prevh += k * scale
		prevw += k
	}
	if (resizeImg) {
		active = false
		moveImg = false
		chanL = x
		preload.style.width = prevw + "px"
		preload.style.height = prevh + "px"
	}
}

function EndSize() {
	moveImg = false
	active = false
	resizeImg = false
}

function moveImgStart(e) {
	var ref = document.getElementsByClassName("drop")[0].getBoundingClientRect()
	if (e.type === "touchstart") {
		posMove = {
			x: e.touches[0].clientX - ref.left,
			y: e.touches[0].clientY - ref.top
		};
	} else {
		posMove = {
			x: e.clientX - ref.left,
			y: e.clientY - ref.top
		};
	}
	moveImg = true
}

function moveImgF(event) {
	var x = 0
	var y = 0
	if (event.type === "touchmove") {
		x = event.touches[0].clientX - posMove.x;
		y = event.touches[0].clientY - posMove.y;
	} else {
		x = event.clientX - posMove.x;
		y = event.clientY - posMove.y;
	}
	if (moveImg) {
		active = false
		resizeImg = false
		document.getElementsByClassName("drop")[0].style.left = x + "px"
		document.getElementsByClassName("drop")[0].style.top = y + "px"
	}
}

function moveImgStop() {
	moveImg = false
	active = false
	resizeImg = false
}
var delta = 0,
	old = 0

function Scroll(evt) {

	if (evt.type === "touchmove" && evt.touches.length === 2) {
		boardTools.scroll = true
		boardTools.touchDown = false
		if (old !== 0)
			delta = evt.touches[1].clientY * evt.touches[1].clientX - evt.touches[0].clientY * evt.touches[0].clientX - old
		old = evt.touches[1].clientY * evt.touches[1].clientX - evt.touches[0].clientY * evt.touches[0].clientX
	} else delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
	if (delta === 0) return
	if (boardTools.scale < 10.1 && delta > 0)
		boardTools.scale += 0.1
	else if (boardTools.scale > 0.2 && delta < 0)
		boardTools.scale -= 0.1
	delta = 0
	old = 0
	board.transform(boardTools.ctx);
	return evt.preventDefault() && false;
};

screen.orientation.onchange = function () {
	boardTools.canvas.width = screen.width
	boardTools.canvas.height = screen.height
	board.transform(boardTools.ctx)
	boardTools.ctx.strokeStyle = document.getElementById("pickColor").style.backgroundColor
	boardTools.ctx.fillStyle = document.getElementById("pickColor").style.backgroundColor
};

for (var i = 0; i < document.getElementsByClassName("tool").length; i++) {
	document.getElementsByClassName("tool")[i].addEventListener("click", function () {
		board.changeTool(this.getAttribute("id"));
		if (document.getElementsByClassName("boardBtnSelected")[0] !== undefined)
			document.getElementsByClassName("boardBtnSelected")[0].classList.remove("boardBtnSelected")
		var r = document.getElementsByClassName("visible")[0]
		if (r !== undefined)
			r.classList.remove("visible")
		this.classList.add('boardBtnSelected');
	});
}
for (var i = 0; i < document.getElementsByClassName("dropRight").length; i++) {
	document.getElementsByClassName("dropRight")[i].addEventListener('click', function () {
		var r = document.getElementsByClassName("visible")[0]
		if (r !== undefined)
			r.className = "toolbox fadeInLeft"
		this.parentNode.childNodes[3].className = "toolbox fadeInLeft visible"
	});
}
for (var i = 0; i < document.getElementsByClassName("predefined__color").length; i++) {
	document.getElementsByClassName("predefined__color")[i].addEventListener("click", function () {
		var color = this.style.backgroundColor;
		var colorPick = document.getElementsByClassName("picked__color")
		colorPick[0].style = "background-color:" + color
		board.changeColor(color);
		var r = document.getElementsByClassName("visible")[0].classList
		r.value = "toolbox fadeInLeft"
	})
}

document.getElementById("size").addEventListener("change", function () {
	if (this.value > 0 && this.value < 6)
		board.changeSize(this.value);
});

for (var i = 0; i < document.getElementsByClassName("txtFontStyle").length; i++) {
	document.getElementsByClassName("txtFontStyle")[i].addEventListener("click", function () {
		boardTools.text.fontStyle = this.getAttribute("data-value");
		document.getElementsByClassName("boardBtnSelected")[0].classList.value = "tools__item tool boardBtn"
		console.log(document.getElementsByClassName("boardBtnSelected")[0])
		this.classList.add('boardBtnSelected');
	});
}

document.getElementById("txtFontSize").addEventListener("change", function () {
	if (this.value > 9 && this.value < 73)
		document.getElementById("txtText").style.fontSize = this.value
	setTimeout(function () {
		document.getElementById("txtText").focus()
	}, 50)
});

document.getElementById('ImageLoad').addEventListener('change', function (e) {
	var files = e.target.files[0];
	board.loadImage(files)
}, false);
document.getElementById('ImageLoad').addEventListener('click', function (e) {
	document.getElementById('ImageLoad').value = "";
}, false);


document.getElementById("CancelCanvas").addEventListener("click", function () {
	document.getElementById("preloadImg").src = ""
	document.getElementById("LoadedImage").style.display = "none"
	document.getElementById("rotation").style.transform = "rotate(" + 0 + "deg)"
	angle = 0
	boardTools.tool = "pencil";
})
document.getElementById("saveImage").addEventListener("click", function () {
	document.getElementById("ImgSave").href = boardTools.canvas.toDataURL();
	document.getElementById("ImgSave").download = "image.png";
	boardTools.tool = "pencil";
})

document.getElementsByClassName("smiley")[0].addEventListener("click", function () {
	if (document.getElementsByClassName("tooltip")[0].style.visibility === "hidden")
		document.getElementsByClassName("tooltip")[0].style.visibility = "visible"
	else document.getElementsByClassName("tooltip")[0].style.visibility = "hidden"
})
for (var i = 0; i < document.getElementsByClassName("ec").length; i++) {
	document.getElementsByClassName("ec")[i].addEventListener("click", function () {
		document.getElementsByClassName("text-box")[0].innerHTML += this.outerHTML
		document.getElementsByClassName("tooltip")[0].style.visibility = "hidden"
	})
}
document.getElementById("drag").addEventListener("click", function () {
	removeBlock("txtText")
	document.getElementById("txtFontSize").style.display = "none"
	if (!boardTools.dragged) {
		boardTools.dragged = true
		boardTools.canvas.classList.add("grab")
	} else {
		boardTools.canvas.classList.remove("grab")
		boardTools.dragged = false
		boardTools.canvas.style.cursor = "crosshair"
	}
})

for (var i = 0; i < document.getElementsByClassName("grip").length; i++) {
	document.getElementsByClassName("grip")[i].addEventListener('mousedown', StartSize, false);
	document.getElementsByClassName("grip")[i].addEventListener('mousemove', sizeChange, false);
	document.getElementsByClassName("grip")[i].addEventListener('mouseup', EndSize, false);
	document.getElementsByClassName("grip")[i].addEventListener('touchstart', StartSize, false);
	document.getElementsByClassName("grip")[i].addEventListener('touchmove', sizeChange, false);
	document.getElementsByClassName("grip")[i].addEventListener('touchend', EndSize, false);
}
document.getElementById("canvas").addEventListener('mousedown', drawStart)
document.getElementById("canvas").addEventListener('touchstart', drawStart, false)
document.getElementById("canvas").addEventListener('mouseup', drawEnd, false);
document.getElementById("canvas").addEventListener('touchend', drawEnd, false);
document.getElementById("canvas").addEventListener('mousemove', drawRealT, false);
document.getElementById("canvas").addEventListener('touchmove', drawRealT, false);
document.getElementById("canvas").addEventListener('DOMMouseScroll', Scroll, false);
document.getElementById("canvas").addEventListener('mousewheel', Scroll, false);
document.getElementById("canvas").addEventListener('touchmove', Scroll, false);
document.getElementsByClassName("drop")[0].addEventListener("mousedown", moveImgStart, false)
document.getElementsByClassName("drop")[0].addEventListener("mousemove", moveImgF, false)
document.getElementsByClassName("drop")[0].addEventListener("mouseup", moveImgStop, false)
document.getElementsByClassName("drop")[0].addEventListener("touchstart", moveImgStart, false)
document.getElementsByClassName("drop")[0].addEventListener("touchmove", moveImgF, false)
document.getElementsByClassName("drop")[0].addEventListener("touchend", moveImgStop, false)
document.getElementsByClassName("drop")[0].addEventListener('mouseup', EndSize, false);
document.getElementsByClassName("rotator")[0].addEventListener("mousedown", start, false)
document.getElementsByClassName("rotator")[0].addEventListener("mouseup", stop, false)
document.getElementsByClassName("rotator")[0].addEventListener("mousemove", rotate, false)
document.getElementsByClassName("rotator")[0].addEventListener("touchstart", start, false)
document.getElementsByClassName("rotator")[0].addEventListener("touchend", stop, false)
document.getElementsByClassName("rotator")[0].addEventListener("touchmove", rotate, false)
document.getElementById("LoadedImage").addEventListener("mousemove", rotate, false)
document.getElementById("LoadedImage").addEventListener("mouseup", stop, false)
document.getElementById("LoadedImage").addEventListener("click", stop, false)
document.getElementById("LoadedImage").addEventListener("mouseup", EndSize, false)
document.getElementById("LoadedImage").addEventListener("mousemove", sizeChange, false)
