var express = require('express');
var app = express();
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://chatroom.db');
var engines = require('consolidate');
app.engine('html', engines.hogan); 
app.set('views', __dirname + '/templates');
app.use(express.static(__dirname + '/public'));
//app.use(express.bodyParser()); // middleware used for POST request handling; see below
// your app's code here

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function generateRoomIdentifier() {
	// make a list of legal characters
	// we're intentionally excluding 0, O, I, and 1 for readability
	var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	var result = '';
	for (var i = 0; i < 6; i++)
	result += chars.charAt(Math.floor(Math.random() * chars.length));
	return result;
}

function insertBlockToMessagesEntity(room,nickname,body){
	var d = new Date(); // for now
	// currentTime = (d.getHours()+":"+d.getMinutes());
	conn.query("INSERT INTO messages VALUES($1,$2,$3,$4);",[room,nickname,body,d]);
}

function insertItemToRoomEntity(room){
	conn.query("INSERT INTO rooms VALUES($1);",[room]);
}

function selectMessageFromCertainRoomAndMessage(room,response){
	var l = [];
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
	var nickname = request.body.nickname; // something like: 'Trump'
	var message = request.body.message;
	insertBlockToMessagesEntity(name,nickname,message);
	//response.render('index.html',{roomMessagesDisplay:message});
});

app.get('/:roomName',function(request,response){
	var name = request.params.roomName;
	response.render('index.html',{roomName: request.params.roomName});
});

app.get('/',function(request,response){
	response.render('home.html');
});







app.listen(8080);
