angular.module('VoteService', []).factory('Votes', ['$http', function($http) {

    var urlBase = '/api/votes';
    var Votes = {};

	Votes.saveVote = function (vote, idea, user) {
		voteobj = {
			vote: vote,
			author_id: user._id,
			idea_id: idea._id,
		};
        return $http.post(urlBase, voteobj);
    };
	
	return Votes;
}]);