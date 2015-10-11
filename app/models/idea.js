var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ideaSchema = new Schema({
	name: {type: String, default: ''},
	description: {type: String, default: ''},
	creation_date: {type: Date, default: Date.now},
	author_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
	category_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
	votes_up: {type: Number, default: 0},
	votes_down: {type: Number, default: 0},
});

ideaSchema.set('validateBeforeSave', true);

ideaSchema.path('name').validate(function (value) {
    return !!value && value.length > 5;
});

ideaSchema.path('description').validate(function (value) {
    return !!value && value.length > 5;
});

ideaSchema.path('author_id').validate(function (value) {
    return !!value;
});

ideaSchema.path('category_id').validate(function (value) {
    return !!value;
});

module.exports = mongoose.model('Idea', ideaSchema);