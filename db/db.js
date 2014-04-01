var mongoose = require('mongoose');
mongoose.connect('localhost', 'drawit');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Connected to DB');
});


// Phrase Schema
var phraseSchema = mongoose.Schema({
  category: { type: String, required: true },
  phrase: { type: String, required: true },
  picked: { type: Number, required: true, min: 0 },
  guessed: { type: Number, required: true, min: 0 },
});

// Expose model
module.exports = mongoose.model('Phrase', phraseSchema);
