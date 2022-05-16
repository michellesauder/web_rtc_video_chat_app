const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));



// const app = require("express")();
// const server = require("http").createServer(app);
// const cors = require("cors");
// // const fs = require("fs");

// // const privateKey  = fs.readFileSync('cert.pem');
// // const certificate = fs.readFileSync('key.pem');

// // const credentials = {key: privateKey, cert: certificate, requestCert: false, rejectUnauthorized: false, ca: fs.readFileSync('csr.csr'),};

// // const server = require("https").createServer(credentials, app);

// //io server side instance

// // socket.io --> fetch --> server --> client each time you make a request
// //Websocket ---> one connections --> client

// const io =  require("socket.io")(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// app.use(cors());

// const ids = new Set();

// const PORT = process.env.PORT || 5000;

// app.get("/", (req, res) => {
//     res.send("server is running");
// });

// io.on("connection", (socket) => {

//     //gives back socket connection user id
//     socket.emit('me', socket.id);

//     console.log('my id: ', socket.id);
//     // ids.add(socket.id);
    
//     //sends message to frontend to let them know its disconnected
//     socket.on("disconnect", () => {
//         socket.broadcast.emit("callEnded");
//     });

//     //info about user that is calling and data
//     socket.on("callUser", ({ userToCall, signalData, from, name }) => {
//         io.to(userToCall).emit("callUser", { signal: signalData, from, name})
//     });

//     // info on when the call is accepted and passing the signal data to the front-end side
//     socket.on("answerCall", (data) => {
//         io.to(data.to).emit("callAccepted", {signal: data.signal})
//     })
// })

// server.listen(PORT, () => console.log(`listening on port ${PORT}` ))