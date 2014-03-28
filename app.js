var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , routes = require('./routes')
  , drawit = require('./routes/drawit')
  , http = require('http')
  , path = require('path');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

drawit.configure(server);

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/drawit',drawit.index);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
