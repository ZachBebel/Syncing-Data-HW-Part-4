//get the HTTP module and create a server. This time we will store the returned server as "app"
var app = require('http').createServer(handler);
//grab socketio and pass in our server "app" to create a new socketio server running inside of our HTTP server
//Socket.io can also run individually, but in this case we want it to run with our webpages, so we will use the module's
//option to allow us to embed it
var io = require('socket.io')(app);
//grab our file system 
var fs = require('fs');

//get the PORT for the server
//Remember we use process.env.PORT or process.env.NODE_PORT to check if we are running on a server
//that already has set ports in the environment configuration
var PORT = process.env.PORT || process.env.NODE_PORT || 3000;

//tell your server to listen on the port
app.listen(PORT);


//Our HTTP server handler. Remember with an HTTP server, we always receive the request and response objects
function handler(req, res) {
    //read our file ASYNCHRONOUSLY from the file system. This is much lower performance, but allows us to reload the page
    //changes during development. 
    //First parameter is the file to read, second is the callback to run when it's read ASYNCHRONOUSLY
    fs.readFile(__dirname + '/../client/index.html', function (err, data) {
        //if err, throw it for now
        if (err) {
            throw err;
        }

        //otherwise write a 200 code and send the page back
        //Notice this is slightly different from what we have done in the past. There is no reason for this, just to keep it simple.
        //There are multiple ways to send things in Node's HTTP server module. The documentation will show the optional parameters. 
        res.writeHead(200);
        res.end(data);
    });
}

/** Now we need to code our web sockets server. We are using the socket.io module to help with this. 
    This server is a SEPARATE server from our HTTP server. They are TWO DIFFERENT SERVERS. 
    That said, socket.io allows us to embed our websockets server INSIDE of our HTTP server. That will allow us to
    host the socket.io libraries on the client side as well as handle the websocket port automatically. 
**/
//When new connections occur on our socket.io server (we receive the new connection as a socket in the parameters)
io.on('connection', function (socket) {

    //join that socket to a hard-coded room. Remember rooms are just a collection of sockets. A socket can be in none, one or many rooms. 
    //A room's name is just a string identifier. It can be anything you make. If the room exists when you add someone, it adds them to the room.
    //If the room does not exist when you add someone, it creates the room and adds them to it. 
    socket.join('room1');

    //When we receive a 'movementUpdate' message from this client
    //The messages are also just strings. They can be anything you write (or one of the few hard-coded built-in ones)
    //"movementUpdate" is one that we have made up right now to handle updates in movement.
    //The "data" is what data we have received from the client. This is usually unpacked as json. It can also be arrays, binary, strings and more.
    socket.on('drawToServer', function (data) {

        //grab ALL sockets in the room and emit the newly updated square to them. 
        //We are sending an "updatedMovement" message back to the user of our updated square
        //Remember io.sockets.in sends a message to EVERYONE in the room vs broadcast which sends to everyone EXCEPT this user. 
        io.sockets.in('room1').emit('drawToClient', data);
    });

    //When the user disconnects, remove them from the room (since they are no longer here)
    //The socket is maintained for a bit in case they reconnect, but we do want to remove them from the room
    //Since they are currently disconnected.
    socket.on('disconnect', function (data) {
        socket.leave('room1');
    });
});

console.log("listening on port " + PORT);