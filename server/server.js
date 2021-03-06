const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Users = require('./users');
const bodyParser = require('body-parser');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();

/* Создаем http-сервер для использования его вместе с socket.io */
var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();
var disconnectUser = false;

app.use(express.static(publicPath));
app.use(bodyParser.json());

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

		//восстановление сохранения пойдет))
		io.to(socket.id).emit('drawingRestore', users.getData(params.room))
		callback();
		disconnectUser = false
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
			users.setData(user.room, data)
			socket.broadcast.to(user.room).emit('drawing', data)
		} catch (e) {}
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

	socket.on('updateUser', (name) => {
		var user = users.getUser(socket.id);
		users.updateUserName(socket.id, name);
		/* Отправляем всем в определенной комнате */
		io.to(user.room).emit('newMessage', generateMessage('Сервер', `Anonymous изменил имя на ${name}`));
	});

	/* Клиент отключился от сервера */
	socket.on('disconnect', (reason) => {
		console.log(reason)
		var user = users.removeUser(socket.id);
		if (user) {
			/* Отправляем всем в определенной комнате */
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Сервер', `${user.name} покинул чат`));
		}
	})
});

server.listen(port, () => {
	console.log(`Сервер работает на порту ${port}`);
});
app.post('/', (req, res) => {
	let rooms = users.getRoom(req.body.name)
	res.json(JSON.stringify({
		rooms
	}))
});
