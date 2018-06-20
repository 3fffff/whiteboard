class Users {
    constructor() {
        this.users = [];
        this.rooms = []
    }

    addUser(id, name, room, visible) {
        var user = {
            id,
            name,
            room
        };
        var verD = this.users.filter(x => x.room === room)
        if (verD.length === 0) {
            var d = {
                id,
                room,
                data: [],
                visible
            }
            this.rooms.push(d)
        }
        console.log("пользователь")
        console.log(user)
        this.users.push(user);
    }

    removeUser(id) {
        var user = this.getUser(id);

        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
            this.removeData(user.room)
        }
        return user;
    }

    removeData(room) {
        console.log(room)
        var res = this.users.filter(x => x.room === room)
        if (res.length === 0) {
            this.rooms = this.rooms.filter(x => x.room !== room)
            console.log("удаляем данные")
        }
    }

    getUser(id) {
        return this.users.filter((user) => user.id === id)[0]
    }

    getUserList(room) {
        var users = this.users.filter((user) => user.room === room)
        return users.map((user) => user.name)
    }
    getData(room) {
        console.log("получаем данные от комнаты")
        console.log(room)
        return this.rooms.filter((x) => x.room === room)[0].data
    }

    setData(room, data) {
        if(room && data) {
            var dt = this.rooms.filter((x) => x.room === room)
            dt[0].data.push(data)
        }
            console.log("вставляем данные")
            console.log(room)
        console.log(dt[0].data.length)
    }
    getRoom(room){
        let res=this.rooms.filter((x) => x.room.toLocaleLowerCase().includes(room) && x.visible!=="false")
        return res.map((r)=>r.room)
    }
    updateUserName(id,name){
         var nuser=this.users.filter((user) => user.id === id)[0]
        nuser.name=name
    }
}
module.exports = Users;