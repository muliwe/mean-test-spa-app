angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix('!');
	$routeProvider

		.when('/', {
			templateUrl: 'views/ideas.html',
			controller: 'MainController',
		})

		.when('/home', {
			templateUrl: 'views/ideas.html',
			controller: 'MainController',
		})

		.when('/categories', {
			templateUrl: 'views/categories.html',
			controller: 'CategoriesController',
		})

		.when('/categories/:category_id', {
			templateUrl: 'views/ideas.html',
			controller: 'MainController',
		})

		.when('/users', {
			templateUrl: 'views/users.html',
			controller: 'UsersController',
		})

		.when('/users/:user_id', {
			templateUrl: 'views/ideas.html',
			controller: 'MainController',
		})
		
		.when('/votes', {
			templateUrl: 'views/ideas.html',
			controller: 'MainController',
		})

		.otherwise({redirectTo: '/'});

}]);