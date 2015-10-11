var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category     = require('./category')
, Author         = require('./author')
, Idea           = require('./idea')
;

module.exports = {
	update_author_ideas_counter : function (author_id) {
		Author.findById(author_id, function(err, author) {
            if (err)
                console.log(err);

            author.ideas += 1;

            author.save(function(err) {
                if (err)
					console.log(err);
            });
        });
	},

	update_category_ideas_counter : function (category_id) {
		Category.findById(category_id, function(err, category) {
            if (err)
                console.log(err);

            category.ideas += 1;

            category.save(function(err) {
                if (err)
					console.log(err);
            });
        });
	},
	
	update_idea_votes : function (idea_id, old_vote, new_vote) {
		Idea.findById(idea_id, function(err, idea) {
            if (err)
                console.log(err);

			// remove old vote
            if (old_vote > 0) {
				idea.votes_up -=1;
			} else if (old_vote < 0) {
				idea.votes_down -=1;
			} 

			// add new vote
            if (new_vote > 0) {
				idea.votes_up +=1;
			} else if (new_vote < 0) {
				idea.votes_down +=1;
			} 

            idea.save(function(err) {
                if (err)
					console.log(err);
            });
        });
	},
};
