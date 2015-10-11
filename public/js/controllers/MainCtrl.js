angular.module('MainCtrl', []).controller('MainController', 
	['$scope', '$routeParams', '$location', '$sce', 'ipCookie', 'Ideas', 'Categories', 'Users', 'Votes',
	function ($scope, $routeParams, $location, $sce, ipCookie, Ideas, Categories, Users, Votes) {
	
	$scope.status = ( $routeParams.category_id ? "Loading ideas for Category..." : 
						( $routeParams.user_id ? "Loading ideas for User..." : "Loading ideas..." )
					);
	$scope.subtitle = $sce.trustAsHtml("To Improve Our Service");
    $scope.ideas;
    $scope.category;
    $scope.user;
    $scope.loggeduser;
    $scope.filterbyvotes = false;
    $scope.postform = ($routeParams.user_id ? false : true);
	$scope.newidea = newIdea();

	getLoggedInUser();
    if ($routeParams.category_id) getCategory($routeParams.category_id);
    if ($routeParams.user_id) getUser($routeParams.user_id);

    $scope.categories;
    getCategories();
 
    function getCategories() {
        Categories.getCategories()
            .success(function (categories) {
                $scope.categories = categories;
            })
            .error(function (error) {
                $scope.status = 'Unable to load categories: ' + error.message;
            });
    }
	
	function getLoggedInUser() {
		var user_id = ipCookie('userId');
		Users.getUser(user_id || 0) // or get anonimous
			.success(function (user) {
				if (user.name === 'anonimous') {
					user.anonimous = true;
					user.name = '';
				} else {
					if ($location.url() == '/votes')
						$scope.filterbyvotes = user._id;
				}
				ipCookie('userId', user._id);
				$scope.loggeduser = user;
				$scope.newidea.user_id = user._id;
				if ($routeParams.user_id == $scope.loggeduser._id) 
					$scope.postform = true;
			    getIdeas($routeParams.category_id, $routeParams.user_id, $scope.filterbyvotes);
			})
			.error(function (error) {
				$scope.status = 'Unable to get user: ' + error.message;
			});
	}
	
    function newIdea() {
		var new_idea = {};
		if ($scope.category)
			new_idea.category_id = $scope.category._id;
		return new_idea;
    }
	
    function getIdeas(category_id, user_id, votes_user_id) {
        Ideas.getIdeas(category_id, user_id, votes_user_id)
            .success(function (ideas) {
                $scope.ideas = ideas;
				$scope.status = ( $routeParams.category_id ? "Loading ideas for Category... Done." : 
						( $routeParams.user_id ? "Loading ideas for User... Done." : "Loading ideas... Done." )
					);
				})
            .error(function (error) {
                $scope.status = 'Unable to load ideas: ' + error.message;
            });
    }
	
    function getCategory(category_id) {
        Categories.getCategory(category_id)
            .success(function (category) {
                $scope.category = category;
				$scope.subtitle = $sce.trustAsHtml("<a href=\"#!/categories\">Category</a>: " + category.name);
            })
            .error(function (error) {
                $scope.status = 'Unable to load category: ' + error.message;
            });
    }

    function getUser(user_id) {
        Users.getUser(user_id)
            .success(function (user) {
                $scope.user = user;
				$scope.subtitle = $sce.trustAsHtml("<a href=\"#!/users\">User</a>: " + user.name);
            })
            .error(function (error) {
                $scope.status = 'Unable to load user: ' + error.message;
            });
    }
	
	$scope.saveUser = function () {
        Users.saveUser($scope.loggeduser)
            .success(function (user) {
				ipCookie('userId', user._id);
                $scope.loggeduser = user;
            })
            .error(function (error) {
                $scope.status = 'Unable to save user: ' + error.message;
            });
	}

	$scope.vote = function (vote, idea) {
		if ($scope.loggeduser.anonimous) // anonimous can't vote
			return false;
		
        Votes.saveVote(vote, idea, $scope.loggeduser)
            .success(function (vote) {
				if (vote.voted === 1) idea.votes_up += 1;
				else if (vote.voted === -1) idea.votes_down += 1;
				else if (vote.voted === 2) {
					idea.votes_up += 1;
					idea.votes_down -= 1;
				}
				else if (vote.voted === -2) {
					idea.votes_up -= 1;
					idea.votes_down += 1;
				}
            })
            .error(function (error) {
                $scope.status = 'Unable to save vote: ' + error.message;
            });
	}

	$scope.saveIdea = function () {
		$scope.newidea.category_id = $scope.newidea.category_id || $scope.category._id;
		if (!$scope.newidea.category_id) {
            $scope.status = 'Category not set';
			return;
		}
        Ideas.saveIdea($scope.newidea)
            .success(function (idea) {
				$scope.newidea = newIdea(); // clear form
				$scope.postform = false; // hide form
				getIdeas($routeParams.category_id, $routeParams.user_id); // refresh ideas list
            })
            .error(function (error) {
                $scope.status = 'Unable to save Idea: ' + error.message;
            });
	}

	}]
);