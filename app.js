
/**
 * Module dependencies.
 */

var express = require('express')
 ,	routes = require('./routes')
 ,	http = require('http')
 ,  fs = require('fs')
 ,  cheerio = require('cheerio')
 ,  request = require('request')
 ,  json2csv = require('json2csv')
 ,	path = require('path')
 ,  app = express()
 ,  date = new Date()
 ,  server = http.createServer(app)
 ,  io = require('socket.io').listen(server)
 ,  tempVar;


 

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser({limit: '50mb'}));
app.use(express.bodyParser());


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('home');
});
app.post('/',
	routes.index
);


app.post('/download', function(req, res){
	res.render('download', {csvThing: tempVar})
})

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('saveFile', function (data) {

			  tempVar = data;
			  console.log(tempVar)

   });
});

