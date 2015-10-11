var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authorSchema = new Schema({
	name: {type: String, default: 'anonimous', unique: true, trim: true},
	ideas: {type: Number, default: 0},
	voted: [{type: mongoose.Schema.Types.ObjectId, ref: 'Idea'}]
});

authorSchema.set('validateBeforeSave', true);

authorSchema.path('name').validate(function (value) {
    return value.length > 5;
});

module.exports = mongoose.model('Author', authorSchema);