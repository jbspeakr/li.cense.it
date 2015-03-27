'use strict';

angular.module('licker', ['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/table.html',
        controller: 'MainCtrl'
      })
      .otherwise('/');
  }).controller('MainCtrl', function ($scope, $http) {
        $scope.$watch('search', function (input) {
            var domainhacks = [];

            angular.forEach($scope.domains, function (domain){
                var match = input.toLowerCase().match(domain['tld']);
                if(match){
                    var domainhack = domainhackBuilder.make(input, domain);
                    domainhacks.push(domainhack);
                }
            });

            $scope.domainhacks = domainhacks;
    });
});