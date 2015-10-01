// script.js
// create the module and name it lyticly
var lyticly = angular.module('lyticly', []);

var lyticly = angular.module('lyticly', ['ngRoute', 'chart.js']);

// configure our routes
lyticly.config(function($routeProvider) {
  $routeProvider

  // route for the home page
  .when('/', {
    templateUrl : 'pages/home.html',
    controller  : 'mainController'
  })

  // route for the about page
  .when('/about', {
    templateUrl : 'pages/about.html',
    controller  : 'aboutController'
  })

  // route for the contact page
  .when('/contact', {
    templateUrl : 'pages/contact.html',
    controller  : 'contactController'
  });
});

// create the controller and inject Angular's $scope
lyticly.controller('mainController', function($scope, $http) {
  // create a message to display in our view
  $scope.weekly_stats_data = [[]];
  $scope.hourly_stats_data = [];
  $scope.hourly_stats_labels = [];
  for(i = 0; i < 7; i++) {
    $scope.weekly_stats_data[0].push(0);
    hours = []
    for(j = 0; j < 24; j++) {
      if (i === 0) {
        $scope.hourly_stats_labels.push(j+1);
      }
      hours.push(0);
    }
    $scope.hourly_stats_data.push(hours);
  }
  $scope.weekly_stats_labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  $scope.hourly_series = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  $scope.percent_options = {
      scaleOverride : true,
      scaleSteps : 10,
      scaleStepWidth : 10,
      scaleStartValue : 0
  }

  $http.get('http://localhost:8080/week-stats').then(function(data){
    data.data.forEach(function(row){
      $scope.weekly_stats_data[0][row.weekday] = row.percent;
    });
  });

  $http.get('http://localhost:8080/hourly-stats').then(function(data){
    data.data.forEach(function(row){
      $scope.hourly_stats_data[row.weekday][row.hourofday] = row.percent;
    });
  });

  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.message = 'Everyone come and see how good I look!';
});

lyticly.controller('aboutController', function($scope) {
  $scope.message = 'Look! I am an about page.';
});

lyticly.controller('contactController', function($scope) {
  $scope.message = 'Contact us! JK. This is just a demo.';
});
