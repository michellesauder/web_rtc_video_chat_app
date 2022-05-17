
const app = require("express")();
const httpServer = require("http").createServer(app);
const cors = require("cors");
const path = require("path")
const fs = require("fs");

const privateKey  = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem');


const io = require("socket.io")(httpServer, {
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
    console.log('in connect')

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

httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));