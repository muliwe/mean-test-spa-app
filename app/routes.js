var Category     = require('./models/category')
, Author         = require('./models/author')
, Idea           = require('./models/idea')
, Vote           = require('./models/vote')
, Counter        = require('./models/counter')
;

module.exports = function(app, router) {
	
	router.use(function(req, res, next) {
		console.log('Api accessed ' + req.method + ' at ' + req.protocol + '://' + req.get('Host') + '/api' + req.url);
		next(); 
	});	

	router.route('/categories/:category_id')

    .get(function(req, res) {

		Category.findById(req.params.category_id, function(err, category) {
            if (err)
                res.status(404).send(err);
			else 
				res.json(category);
        });
        
    });

	router.route('/categories')

    .get(function(req, res) {

        Category.find({}).sort('-ideas').exec(function(err, categories) {
            if (err)
                res.status(404).send(err);
			else 
				res.json(categories);
        });
        
    });

	router.route('/users/:user_id')

    .get(function(req, res) {

		if (req.params.user_id == 0) {

			// get anonimous
			
			filter = {name: 'anonimous'};
			Author.find(filter, function(err, authors) {
				if (err)
					res.status(404).send(err);
				else 
					res.json(authors[0]);
			});
			
		} else {

			Author.findById(req.params.user_id, function(err, author) {
				if (err || !author)
					res.redirect('/api/users/0'); // can't find uathor, redirecting to anonimous
				else 
					res.json(author);
			});
		
		}
        
    });

	router.route('/users')

    .post(function(req, res) {
        var author = new Author();
        author.name = req.body.name;
		
        author.save(function(err) {
            if (err)
                res.status(500).send(err);
			else 
				res.json(author);
        });
        
    })
    .get(function(req, res) {

        Author.find({}).sort('-ideas').find(function(err, authors) {
            if (err)
                res.status(404).send(err);
			else
				res.json(authors);
        });
        
    });

	router.route('/ideas')

    .post(function(req, res) {
        var idea = new Idea();
        idea.name = req.body.name;
        idea.description = req.body.description;
		idea.author_id = req.body.user_id;
		idea.category_id = req.body.category_id;
		
        idea.save(function(err) {
            if (err)
                res.status(500).send(err);
			else {
				res.json(idea);
				Counter.update_author_ideas_counter(idea.author_id);
				Counter.update_category_ideas_counter(idea.category_id);
			}
        });
        
    })
	
    .get(function(req, res) {
		var filter = {};
		if (req.query.voted_by) {
			
			Author.findById(req.query.voted_by, function(err, author) {
				if (err || !author || author.name == 'anonimous')
					res.status(500).send(err);
				else 
					filter = {'_id': { $in: author.voted}};

					Idea.find(filter).populate('category_id author_id').sort('-creation_date').exec(function(err, ideas) {
						if (err)
							res.status(404).send(err);
						else 
							res.json(ideas);
					});
			});
			
		} else {
			if (req.query.category) filter = {category_id: req.query.category};
			else if (req.query.user) filter = {author_id: req.query.user};

			Idea.find(filter).populate('category_id author_id').sort('-creation_date').exec(function(err, ideas) {
				if (err)
					res.status(404).send(err);
				else 
					res.json(ideas);
			});
        }
    });

	router.route('/votes')

    .post(function(req, res) {
		Author.findById(req.body.author_id, function(err, author) {
			if (err || !author || author.name == 'anonimous')
				res.json({voted: 0}); // anonimous or unknown author_id
			else 
			{
				var filter = {author_id: author.id, idea_id: req.body.idea_id};

				Vote.find(filter, function(err, votes) {
					if (err)
						res.status(500).send(err);

					else if (votes.length > 0) {
						// theoretically its not alone
						var vote = votes[0];
						var old_vote = 0;
						
						if (vote.vote != req.body.vote) { // update it
							old_vote = vote.vote;
							vote.vote = req.body.vote
							vote.save(function(err) {
								if (err)
									res.status(500).send(err);
								else {
									res.json({voted: vote.vote-old_vote});
									Counter.update_idea_votes(vote.idea_id, old_vote, vote.vote);
								}
							});
						} else {
							res.json({voted: 0});
						};
					} else { // create new vote
						
						var vote = new Vote();
						vote.vote = req.body.vote;
						vote.author_id = author.id;
						vote.idea_id = req.body.idea_id;
						vote.save(function(err) {
							if (err)
								res.status(500).send(err);
							else {
								res.json({voted: vote.vote});
								Counter.update_idea_votes(vote.idea_id, 0, vote.vote);
								author.voted.push(req.body.idea_id);
								author.save(function(err) {});
							}
						});
					}
				});
			}
		});
    });

	app.use('/api', router);

	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};