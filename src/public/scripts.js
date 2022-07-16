let messageAudio = new Audio("./audio/new-message.wav");
let onlineAudio = new Audio("./audio/online.wav");
let socket = io();
document.addEventListener("DOMContentLoaded", start);
function start() {
    canvasStart();
    chatStart();
}
document.querySelector(".fullscreen").addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.querySelector(".container").requestFullscreen();
        document.querySelector(".fas").classList.remove("fa-expand");
        document.querySelector(".fas").classList.add("fa-compress");
    } else {
        document.querySelector(".fas").classList.remove("fa-compress");
        document.querySelector(".fas").classList.add("fa-expand");
        document.exitFullscreen();
    }
});
function canvasStart() {
    let mouse = {
        click: false,
        move: false,
        pos: {
            x: 0,
            y: 0,
        },
        pos_prev: false,
    };
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    let size = setResolution();
    canvas.width = size;
    canvas.height = size;

    canvas.addEventListener("mousedown", () => {
        mouse.click = true;
    });
    canvas.addEventListener("mouseup", () => {
        mouse.click = false;
    });
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.pos.x = (e.clientX - rect.left) / size;
        mouse.pos.y = (e.clientY - rect.top) / size;
        mouse.move = true;
    });
    canvas.addEventListener("touchstart", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.pos.x = (e.changedTouches[0].clientX - rect.left) / size;
        mouse.pos.y = (e.changedTouches[0].clientY - rect.top) / size;
        mouse.pos_prev = mouse.pos;
        mouse.click = true;
    });
    canvas.addEventListener("touchend", (e) => {
        mouse.click = false;
        mouse.move = false;
    });
    canvas.addEventListener("touchmove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.pos.x = (e.changedTouches[0].clientX - rect.left) / size;
        mouse.pos.y = (e.changedTouches[0].clientY - rect.top) / size;
        mouse.move = true;
    });
    socket.on("draw_line", (cursor) => {
        draw(cursor);
    });

    loop();
    function loop() {
        if (mouse.click && mouse.move && mouse.pos_prev) {
            socket.emit("draw_line", { line: [mouse.pos, mouse.pos_prev] });
            draw({ line: [mouse.pos, mouse.pos_prev] });
            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        setTimeout(loop, 16);
    }
    function draw(cursor) {
        const line = cursor.line;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(line[0].x * size, line[0].y * size);
        ctx.lineTo(line[1].x * size, line[1].y * size);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0f2c2e";
        ctx.stroke();
    }

    function setResolution() {
        return window.innerHeight > innerWidth
            ? window.innerWidth
            : window.innerHeight;
    }
    document.querySelector(".clear").addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit("clear-canvas");
    });
    socket.on("clear-canvas", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function chatStart() {
    let username;
    document.querySelector("#login").addEventListener("submit", (e) => {
        e.preventDefault();
        username = document
            .querySelector("#username")
            .value.trim()
            .toUpperCase();
        if (username.length > 0) socket.emit("buscar_cliente", username);
    });
    socket.on("autentificar", (exist) => {
        if (!exist) {
            socket.emit("new_user", username);
            document.querySelector(".login").classList.add("diffuse");
            setTimeout(() => {
                document.querySelector(".login").classList.add("disabled");
            }, 1000);
            initService();
        } else {
            alert("Ya existe un usuario en la sala con el mismo nombre");
        }
    });
    socket.on("user_online", (online) => {
        onlineAudio.play();
        document.querySelector(
            "#online"
        ).textContent = `Usuarios en linea: ${online}`;
    });
    function initService() {
        let isLogin = true;
        const form = document.querySelector("#message");
        const chat = document.querySelector("#chat");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let message = {
                name: username,
                content: document.querySelector("#content").value.trim(),
            };
            if (message.content.length > 0) {
                socket.emit("nuevo_mensaje", message);
                document.querySelector("#content").value = "";
                document.querySelector("#content").focus();
            }
        });
        socket.on("historial_mensaje", (message) => {
            const parrafo = `<div class="message"><b>${special(
                message.name
            )}</b> : ${special(message.content)}</div>`;
            chat.innerHTML += parrafo;
            scrollToBottom();
        });
        socket.on("difundir_mensaje", (message) => {
            messageAudio.play();
            const parrafo = `<div class="message"><b>${special(
                message.name
            )}</b> : ${special(message.content)}</div>`;
            chat.innerHTML += parrafo;
            scrollToBottom();
        });
        function special(str) {
            str = str.replace(/</gi, "&lt;");
            str = str.replace(/>/gi, "&gt;");
            return str;
        }
        function scrollToBottom() {
            chat.scrollTop = chat.scrollHeight;
        }
    }
}
