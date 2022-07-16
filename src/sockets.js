let clients = [];
let lineHistory = [];
let chatHistory = [];
let online;
module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("NEW USER CONNECTED");

        //*CHAT ***********************************
        socket.on("buscar_cliente", (user) => {
            socket.emit("autentificar", searchClient(user));
        });
        socket.on("new_user", (username) => {
            newUser(username, socket);
        });
        socket.on("nuevo_mensaje", (message) => {
            if (chatHistory.length > 50) chatHistory.shift();
            chatHistory.push(message);
            io.sockets.emit("difundir_mensaje", message);
        });
        socket.once("disconnect", () => {
            let position = clients.findIndex((user) => user.id === socket.id);
            if (position != -1) {
                clients.splice(position, 1);
            }
            online = clients.length;
            console.table(clients);
            io.sockets.emit("user_online", online);
        });

        //*CANVAS ***********************************
        for (let line of lineHistory) {
            socket.emit("draw_line", line);
        }
        socket.on("draw_line", (cursor) => {
            //if (lineHistory.length > 500) lineHistory.shift();
            lineHistory.push(cursor);
            socket.broadcast.emit("draw_line", cursor);
        });
        socket.on("clear-canvas", () => {
            lineHistory = [];
            socket.broadcast.emit("clear-canvas");
        });
    });
    function searchClient(username) {
        let exist;
        clients.findIndex((user) => user.name === username) == -1
            ? (exist = false)
            : (exist = true);
        return exist;
    }

    function newUser(username, socket) {
        const user = {
            id: socket.id,
            name: username,
        };
        clients.push(user);
        console.table(clients);
        online = clients.length;
        io.sockets.emit("user_online", online);
        for (let message of chatHistory) {
            socket.emit("historial_mensaje", message);
        }
    }
};
