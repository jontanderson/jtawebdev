var mongoose = require('mongoose');
mongoose.connect('localhost', 'drawit');
var db = mongoose.connection;
db.on('error', function() {
	console.error.bind(console, 'connection error:');
	console.log("Aborting...");
});
db.once('open', function() {
	console.log('Connected to DB');
});


// Phrase Schema
var phraseSchema = mongoose.Schema({
  category: { type: String, required: true },
  phrase: { type: String, required: true },
  picked: { type: Number, required: true, min: 0 },
});

var Phrases = mongoose.model('Phrases',phraseSchema,'Phrases');
var Categories;

Phrases.distinct("category",function(err,categories) {
	if (err) {
		Categories = [""];
	} else {
		Categories = categories;			
	}
});

exports.getCategories = function() {
	console.log(Categories);
	return Categories;
}

exports.getPhrase = function(category,callback) {
	Phrases.count({category: category},function(err,c) {
		if (err) {
			return callback(err);
		}
		randomNum = Math.floor(Math.random()*c);
		console.log("Random Number is " + randomNum);
		Phrases.findOne({category: category}).limit(-1).skip(randomNum).exec(callback);
	});
};

// Expose model (here if needed later)
//exports.Phrases = Phrases;
