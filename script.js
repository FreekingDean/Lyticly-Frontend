// script.js
// create the module and name it lyticly
var lyticly = angular.module('lyticly', ['ngRoute', 'chart.js']);
var api_endpoint = "http://api.lyticly-dev.com/"
//var authentication = AuthenticationController();
//var api_endpoint = "http://lyticly.appspot.com/"

//Factories

// configure our routes
lyticly.config(function($routeProvider, $httpProvider) {
  $routeProvider
  .when('/login', {
    templateUrl : 'pages/login.html',
    controller  : 'loginController'
  })
  .when('/', {
    templateUrl : 'pages/home.html',
    controller  : 'mainController',
    resolve     : {
      auth: authentication.authFilter
    }
  });

  $httpProvider.defaults.withCredentials = true;
});

lyticly.factory("authService", ["$http","$q","$window",function ($http, $q, $window) {
    var userInfo;

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post(api_endpoint+"login", { userName: userName, password: password })
            .then(function (result) {
                userInfo = result.success
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();

        $http({
            method: "DELETE",
            url: api_endpoint+"logout",
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getUserInfo() {
        return userInfo;
    }

    function init() {
        if ($window.sessionStorage["userInfo"]) {
            //userInfo = JSON.parse($window.sessionStorage["userInfo"]);
        }
    }
    init();

    return {
        login: login,
        logout: logout,
        getUserInfo: getUserInfo
    };
}]);

function AuthenticationController() {
  function authenticate($q, authService) {
    var userInfo = authService.getUserInfo();

    if (userInfo) {
      return $q.when(userInfo);
    } else {
      return $q.reject({ authenticated: false });
    }
  }

  return {
    authFilter: [
      "$q",
      "authService",
      authenticate
    ]
  }
}
authentication = AuthenticationController();
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

  $http.get(api_endpoint + '/week-stats').then(function(data){
    data.data.forEach(function(row){
      $scope.weekly_stats_data[0][row.weekday-1] = row.percent;
    });
  });

  $http.get(api_endpoint + '/hourly-stats').then(function(data){
    data.data.forEach(function(row){
      $scope.hourly_stats_data[row.weekday-1][row.hourofday] = row.percent;
    });
  });

  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.message = 'Everyone come and see how good I look!';
});

lyticly.controller("loginController", ["$scope", "$location", "$window", "authService",function ($scope, $location, $window, authService) {
    $scope.userInfo = null;
    $scope.login = function () {
        authService.login($scope.userName, $scope.password)
            .then(function (result) {
                $scope.userInfo = result;
                $location.path("/");
            }, function (error) {
                $window.alert("Invalid credentials");
                console.log(error);
            });
    };

    $scope.cancel = function () {
        $scope.userName = "";
        $scope.password = "";
    };
}]);

lyticly.controller('contactController', function($scope) {
  $scope.message = 'Contact us! JK. This is just a demo.';
});

lyticly.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeSuccess", function(userInfo) {
    console.log(userInfo);
  });

  $rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
    if (eventObj.authenticated === false) {
      console.log("not logged in");
      $location.path("/login");
    }
  });
}]);
