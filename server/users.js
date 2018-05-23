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
        console.log("видимый")
        console.log(visible)
        var verD = this.users.filter(x => x.room == room)
        if (verD.length == 0) {
            var d = {
                id,
                room,
                data:null,
                visible
            }
            this.rooms.push(d)
        }
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
        var res = this.users.filter(x => x.room == room)
        if (res.length == 0)
            this.rooms = this.rooms.filter(x => x.room !== room)
    }

    getUser(id) {
        return this.users.filter((user) => user.id === id)[0]
    }

    getUserList(room) {
        var users = this.users.filter((user) => user.room === room)
        return users.map((user) => user.name)
    }
    getData(room) {
        var res = this.rooms.filter((x) => x.room === room)
        return res[0].data
    }

    setData(room, data) {
        var dt = this.rooms.filter((x) => x.room === room)
        dt[0].data=data
        this.rooms = this.rooms.filter((x) => x.room !== room)
        this.rooms.push(dt[0])
    }
}

module.exports = Users;
