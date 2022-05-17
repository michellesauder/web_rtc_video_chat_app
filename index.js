
const app = require("express")();
const httpServer = require("http").createServer(app);
const cors = require("cors");
const path = require("path")
const fs = require("fs");

const privateKey  = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem');

console.log({certificate})

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

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);
    console.log('in connect - id:', socket.id)

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

httpsServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));