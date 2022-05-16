const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
// const fs = require("fs");

// const privateKey  = fs.readFileSync('cert.pem');
// const certificate = fs.readFileSync('key.pem');

// const credentials = {key: privateKey, cert: certificate, requestCert: false, rejectUnauthorized: false, ca: fs.readFileSync('csr.csr'),};

// const server = require("https").createServer(credentials, app);

//io server side instance

// socket.io --> fetch --> server --> client each time you make a request
//Websocket ---> one connections --> client

const io =  require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const ids = new Set();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("server is running");
});

io.on("connection", (socket) => {

    //gives back socket connection user id
    socket.emit('me', socket.id);
    // ids.add(socket.id);
    
    //sends message to frontend to let them know its disconnected
    socket.on("disconnect", () => {
        // ids.delete(socket.id);
        socket.broadcast.emit("callEnded");
    });

    //info about user that is calling and data
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        // console.log({signalData, userToCall})
        io.to(userToCall).emit("callUser", { signal: signalData, from, name})
    });

    // info on when the call is accepted and passing the signal data to the front-end side
    socket.on("answerCall", (data) => {
        // console.log('answer call', {data})
        // console.log({ids})
        io.to(data.to).emit("callAccepted", {signal: data.signal})
    })
})

server.listen(PORT, () => console.log(`listening on port ${PORT}` ))