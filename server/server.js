const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Users = require('./users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();

/* Создаем http-сервер для использования его вместе с socket.io */
var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();

app.use(express.static(publicPath));

//проверка строки
var isRealString = (string) => {
	return (typeof string === 'string') && (string.trim().length > 0);
};

//функця сообщения
var generateMessage = (from, text) => {
	return {
		from,
		text
	}
};

/* Событие при подключении клиента к серверу */
io.on('connection', (socket) => {

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback('Имя и название комнаты обязательны к заполнению');
		}

		/* Присоединяемся к определенной комнате */
		socket.join(params.room);

		users.removeUser(socket.id); // Удаляем юзера из других комнат

		/* Добавляем нового юзера */
		users.addUser(socket.id, params.name, params.room, params.visible);

		/* Отправляем всем в определенной комнате */
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));

		/* ШВ сообщения всем в определенной комнате, кроме этого сокета */
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Сервер', `Присоединился новый пользователь - ${params.name}`));
		console.log(users.users)
		var draw = users.getData(params.room)
		//console.log(draw)
		//восстановление сохранения пойдет))
		io.sockets.connected[socket.id].emit('drawingRestore', draw)
		callback();
	});

	/* Новое сообщение */
	socket.on('createMessage', (message, callback) => {
		var user = users.getUser(socket.id);

		if (user && isRealString(message.text)) {
			/*  сообщения всем в определенной комнате */
			console.log(user.name + " " + message.text)
			socket.broadcast.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
		}

	});

	//рисование широковещательное в определенной комнате
	socket.on('drawing', (data) => {
		//нужна проверка по шаблону
		var user = users.getUser(socket.id);
		try {
            socket.broadcast.to(user.room).emit('drawing', data)
        }catch(e){
		}
	});

	//файлы
	socket.on('base64 file', function (msg) {
		var user = users.getUser(socket.id)
		console.log('получен base64 файл от ' + user.name);
		socket.username = user.name;
		socket.broadcast.to(user.room).emit('base64 file', {
			username: socket.username,
			file: msg.file,
			fileName: msg.fileName,
			type: msg.type
		});
	});
socket.on('recover', function (msg) {
    var user = users.getUser(socket.id)
    console.log('восстановление от ' + user.name);
    socket.username = user.name;
    users.setData(user.room, msg.boardData)
    var get=users.getData(user.room, msg.boardData)
	console.log("картинка восстановления")
	console.log(get)
});
	/* Клиент отключился от сервера */
	socket.on('disconnect', () => {
		var user = users.removeUser(socket.id);

		if (user) {
			/* Отправляем всем в определенной комнате */
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Сервер', `${user.name} покинул чат`));
		}
	});
});

server.listen(port, () => {
	console.log(`Сервер работает на порту ${port}`);
});
