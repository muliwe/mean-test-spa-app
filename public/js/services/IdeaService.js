angular.module('IdeaService', []).factory('Ideas', ['$http', function($http) {

    var urlBase = '/api/ideas';
    var Ideas = {};

	Ideas.getIdeas = function (category_id, user_id, votes_user_id) {
		var url = urlBase + 
			( votes_user_id ? '?voted_by=' + votes_user_id : 
				( category_id ? '?category=' + category_id : 
					( user_id ? '?user=' + user_id : ''	)
				)
			)
        return $http.get(url);
    };

    Ideas.getIdea = function (id) {
        return $http.get(urlBase + '/' + id);
    };
	
	Ideas.saveIdea = function (idea) {
        return $http.post(urlBase, idea);
    };
	
	return Ideas;
}]);