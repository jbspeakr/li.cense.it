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

app.controller('mainCtrl', ['$scope', '$q', 'githubApiConnector', function ($scope, $q, githubApiConnector) {
  $scope.githubHandle = '';
  $scope.errorMessage = '';
  $scope.repositories = [];
  $scope.fetched_repositories = [];

  $scope.fetchRepos = function (apiPage, fetchedRepositories) {
    var defaultResultLength = 30;
    var page = apiPage || 1;
    var repositories = fetchedRepositories || [];

    githubApiConnector.fetchRepositories($scope.githubHandle, page).
        success(function (data) {
          if (data.length > 0) {
            repositories = repositories.concat(data);
          }
          if (data.length == defaultResultLength) {
            $scope.fetchRepos(++page, repositories);
          } else{
            $scope.updateFetchedRepositories(repositories);
          }
        }).
        error(function (data, status) {
          if (status == 403) {
            $scope.errorMessage = 'Not able to get complete information: Github just allows you to make up to 60 requests per hour.';
          }
        });
  };

  $scope.checkLicenses = function () {
    $scope.fetched_repositories = [];
    $scope.repositories = [];
    $scope.fetchRepos();
  };

  $scope.updateFetchedRepositories = function (repositories) {
    $scope.fetched_repositories = repositories;
  };

  $scope.updateRepositories = function (repositories) {
    $scope.repositories = repositories;
  };

  $scope.$watch('fetched_repositories', function () {
    var repositories = [];
    angular.forEach($scope.fetched_repositories, function (repository) {
      githubApiConnector.fetchLicenses(repository).
          success(function (data) {
            repositories.push(data);
          }).
          error(function () {
            alert('error.')
          });
    });
    $scope.updateRepositories(repositories);
  });
}]);


app.factory('githubApiConnector', ['$http', function ($http) {
  var api = 'https://api.github.com';
  var page_parameter = '?page=';

  return {
    fetchRepositories: function (githubHandle, page) {
      var user_repo_endpoint = api + '/users/' + githubHandle + '/repos' + page_parameter + page;
      var request = {
        method: 'GET',
        url: user_repo_endpoint
      };
      return $http(request);
    },
    fetchLicenses: function (repo) {
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