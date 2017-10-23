var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://chatroom.db');


conn.query('DROP TABLE messages').on('end',function(){
	console.log('Messages dropped');
});

conn.query('DROP TABLE rooms').on('end',function(){
	console.log('Roomes dropped')
});

conn.query('CREATE TABLE messages(room TEXT, nickname TEXT, body TEXT, time INTEGER);').on('end',function(){
	console.log('Made table!');
});

conn.query('CREATE TABLE rooms(room TEXT);').on('end',function(){
	console.log('Made room table');
});



