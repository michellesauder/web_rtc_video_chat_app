
const app = require("express")();
const httpServer = require("http").createServer(app);
const cors = require("cors");
const fs = require("fs");

const privateKey  = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem');

const credentials = { 
    key: privateKey, 
    cert: certificate, 
    requestCert: false, 
    rejectUnauthorized: false,
    ca: 'csr.csr'
};

const httpsServer = require("https").createServer(credentials, app);

const io = require("socket.io")(httpsServer, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const users = {};

const socketToRoom = {};

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);
	socket.on("join room", roomID => {
		if(users[roomID]){
			const length = users[roomID].length;
			if(length === 4) {
				socket.emit("room full");
				return;
			}
			users[roomID].push(socket.id)
		}else{
			users[roomID] = [socket.id];
		}
		socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
		socket.emit("all users", usersInThisRoom);
	});

	socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

	socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

	socket.on("disconnect", () => {
		const roomID = socketToRoom[socket.id];
		let room = users[roomID];
		if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

httpsServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
