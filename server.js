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

mongoose.Promise = Promise

var dbUrl = process.env.MONGO_URL;

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.status(200).json(messages);
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);

        const savedMessage = await message.save();

        Message.findOne({ message: 'badword' })
            .then((censored) => {
                if (censored) {
                    console.log('Censored words found', censored);
                    Message.deleteOne({ _id: censored.id })
                        .then(() => {
                            console.log('Deleted censored message');
                        })
                } else {
                    io.emit('message', savedMessage);
                    res.status(201).json(savedMessage);
                }
            })
    } catch (error) {
        res.send(error.message);
    }
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