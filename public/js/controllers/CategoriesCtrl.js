angular.module('CategoriesCtrl', []).controller('CategoriesController', 
	['$scope', 'Categories', 
	function ($scope, Categories) {

	$scope.status = 'Loading categories...';
    $scope.categories;
    getCategories();
 
    function getCategories() {
        Categories.getCategories()
            .success(function (categories) {
                $scope.categories = categories;
				$scope.status += " Done.";
            })
            .error(function (error) {
                $scope.status = 'Unable to load categories: ' + error.message;
            });
    }
	
	}]
);