angular.module('CategoryService', []).factory('Categories', ['$http', function($http) {

    var urlBase = '/api/categories';
    var Categories = {};

	Categories.getCategories = function () {
        return $http.get(urlBase);
    };

    Categories.getCategory = function (id) {
        return $http.get(urlBase + '/' + id);
    };

	return Categories;
}]);