require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var dbUrl = process.env.MONGO_URL;

var messages = [
    { name: 'Paul', message: 'Hi' },
    { name: 'John', message: 'Hello' }
];

app.get('/messages', (req, res) => {
    res.send(messages);
})

app.post('/messages', (req, res) => {
    messages.push(req.body);
    io.emit('message', req.body);
    res.sendStatus(200);
})

io.on('connection', (socket) => {
    console.log('A new user connected');
})

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Database connected'))
    .catch(err => console.log('Error: ' + err.message));

process.on('uncaughtException', (error) => {
    console.error(error, 'DB disconnected')
    mongoose.disconnect()
})

var server = http.listen(3000, () => {
    console.log('Server is listening on port ', server.address().port);
});