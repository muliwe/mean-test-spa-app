var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({
	author_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
	idea_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Idea'},
	vote: {type: Number, default: 0},
});

module.exports = mongoose.model('Vote', voteSchema);