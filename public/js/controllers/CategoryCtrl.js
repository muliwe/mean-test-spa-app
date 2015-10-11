angular.module('MainCtrl', []).controller('MainController', ['$scope', '$routeParams', 'Ideas', function ($scope, $routeParams, Ideas) {

	$scope.status = "Loading ideas for Category...";
    $scope.ideas;
    getIdeas($routeParams.category_id);

    function getIdeas(category_id) {
        Ideas.getIdeas(category_id)
            .success(function (ideas) {
                $scope.ideas = ideas;
				$scope.status = "Loading ideas for Category... Done.";
            })
            .error(function (error) {
                $scope.status = 'Unable to load ideas: ' + error.message;
            });
    }

}]);