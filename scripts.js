var socket = io();
$(() => {
    $('#send').click((e) => {
        e.preventDefault();
        var message = { name: $('#name').val(), message: $('#message').val() }
        postMessage(message)
    });
    getMessages()
})

socket.on('message', (data) => {
    addMessage(data)
})

function addMessage(message) {
    $("#messages").append(`<h4> ${message.name} </h4> <p>${message.message}</p>`)
}
function getMessages() {
    $.get('http://localhost:3000/messages', (data) => {
        data.forEach(message => {
            addMessage(message)
        });
    })
}
function postMessage(message) {
    $.post('http://localhost:3000/messages', message)
}