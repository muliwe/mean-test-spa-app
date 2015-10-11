angular.module('UserService', []).factory('Users', ['$http', function($http) {

    var urlBase = '/api/users';
    var Users = {};

	Users.getUsers = function () {
        return $http.get(urlBase);
    };

    Users.getUser = function (id) {
        return $http.get(urlBase + '/' + id);
    };
	
	Users.saveUser = function (user) {
        return $http.post(urlBase, user);
    };
	
	return Users;
}]);