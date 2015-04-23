'use strict';

var app = angular.module('licker', ['ngRoute'])
    .config(function ($routeProvider) {
      $routeProvider
          .when('/', {
            templateUrl: 'views/table.html',
            controller: 'MainCtrl'
          })
          .otherwise('/');
    });

app.controller('mainCtrl', ['$scope', 'githubApiConnector', function ($scope, githubApiConnector) {
  $scope.githubHandle = '';
  $scope.repositories = [];
  $scope.fetched_repositories = [];

  $scope.checkLicenses = function () {

    var page_parameter = '&page=';

    githubApiConnector.fetchReposForUser($scope.githubHandle).
        success(function (data) {
          $scope.fetched_repositories = data;
        }).
        error(function () {
          githubApiConnector.fetchReposForOrganisation($scope.githubHandle).
              success(function (data) {
                $scope.fetched_repositories = data;
              }).
              error(function () {
                $scope.fetched_repositories = $scope.fetched_repositories.push({
                  'name': 'test-repo',
                  'link': 'http://www.google.de',
                  'license': 'Apache License v2'
                });
              })
        });

  };
  $scope.$watch('fetched_repositories', function () {
    angular.forEach($scope.fetched_repositories, function (repository) {
      githubApiConnector.getLicenseForRepo(repository).
          success(function (data) {
            $scope.repositories.push(data);
          }).
          error(function () {
            alert('error.')
          });
    });
  });
}]);


app.factory('githubApiConnector', ['$http', function ($http) {
  var api = 'https://api.github.com';

  return {
    fetchReposForUser: function (githubHandle) {
      var user_repo_endpoint = api + '/users/' + githubHandle + '/repos';
      var request = {
        method: 'GET',
        url: user_repo_endpoint
      };
      return $http(request);
    },
    fetchReposForOrganisation: function (githubHandle) {
      var organisation_repo_endpoint = api + '/orgs/' + githubHandle + '/repos';
      var request = {
        method: 'GET',
        url: organisation_repo_endpoint
      };
      return $http(request);
    },
    getLicenseForRepo: function (repo) {
      var license_endpoint = api + '/repos/' + repo['full_name']
      var request = {
        method: 'GET',
        url: license_endpoint,
        headers: {
          'Accept': 'application/vnd.github.drax-preview+json'
        }
      };
      return $http(request);
    }
  };
}]);