var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Category', {
	name: {type: String, default: ''},
	ideas: {type: Number, default: 0},
});
