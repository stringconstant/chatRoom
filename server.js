var express = require('express');
var app = express();
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://chatroom.db');
var engines = require('consolidate');
app.engine('html', engines.hogan); 
app.set('views', __dirname + '/templates');
app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function insertBlockToMessagesEntity(room,nickname,body){
	var d = new Date(); // Date
	conn.query("INSERT INTO messages VALUES($1,$2,$3,$4);",[room,nickname,body,d]);
}

function insertItemToRoomEntity(room){
	conn.query("INSERT INTO rooms VALUES($1);",[room]);
}

function selectMessageFromCertainRoomAndMessage(room,response){
	var l = []; // Message List
	conn.query("SELECT * FROM messages WHERE room = $1;",[room]).on('data',function(row){
		l.push(row);
	}).on('end', function() {
		response.json(l);
	});
}

app.get('/rooms.json',function(request,response){
	var list = [];
	conn.query("SELECT room FROM messages;").on('data',function(row){
		list.push(row);
	}).on('end', function() {
		response.json(list);
	});
});

app.get('/:roomName/messages.json', function(request,response){
	var name = request.params.roomName;
	var messages = selectMessageFromCertainRoomAndMessage(name, response);
});

app.post('/:roomName/message', function(request,response){
	var name = request.params.roomName; // something like: 'ABC123' 
	var nickname = request.body.nickname; // something like: 'William'
	var message = request.body.message; // something like: 'That chat room is awesome'
	insertBlockToMessagesEntity(name,nickname,message);
});

app.get('/:roomName',function(request,response){
	var name = request.params.roomName;
	response.render('index.html',{roomName: request.params.roomName});
});

app.get('/',function(request,response){
	response.render('home.html');
});

app.listen(8080);