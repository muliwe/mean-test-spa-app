var Category     = require('../app/models/category')
, Author         = require('../app/models/author')
, Idea           = require('../app/models/idea')
, Vote           = require('../app/models/vote')
;

module.exports = function () {
	Category.remove({}, function(err) {
		if (err) {
			console.log('Error setting up data scructure: ' + err.message);
			return;
		}
		
		var categories = ['Forum', 'Shop', 'Articles', 'Other'];
		
		for (var i=0; i<categories.length; i++) {
			var category = new Category();
			category.name = categories[i];
			category.save(function(err) {
				if (err) console.log(err);
			});
		}
	});
	Author.remove({}, function(err) {
		if (err) {
			console.log('Error setting up data scructure: ' + err.message);
			return;
		}
		
		var anonimous = new Author();
		anonimous.save(function(err) {
			if (err) console.log(err);
		});
	});
	Idea.remove({});
	Vote.remove({});
}