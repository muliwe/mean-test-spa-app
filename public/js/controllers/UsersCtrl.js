angular.module('UsersCtrl', []).controller('UsersController', 
	['$scope', 'ipCookie', 'Users', 
	function ($scope, ipCookie, Users) {

	$scope.status = 'Loading users...';
    $scope.users;
	$scope.loggeduser;
    getUsers();
	getLoggedInUser();
 
 	function getLoggedInUser() {
		var user_id = ipCookie('userId');
		Users.getUser(user_id || 0) // or get anonimous
			.success(function (user) {
				if (user.name === 'anonimous') {
					user.anonimous = true;
					user.name = '';
				}
				ipCookie('userId', user._id);
				$scope.loggeduser = user;
			})
			.error(function (error) {
				$scope.status = 'Unable to get user: ' + error.message;
			});
	}
 
    function getUsers() {
        Users.getUsers()
            .success(function (users) {
                $scope.users = users;
				$scope.status += " Done.";
            })
            .error(function (error) {
                $scope.status = 'Unable to load users: ' + error.message;
            });
    }
	
	$scope.myFilter = function (item) { 
		return item._id == $scope.loggeduser._id; 
	};
	
	$scope.notmyFilter = function (item) { 
		return item._id != $scope.loggeduser._id; 
	};
	
	}]
);