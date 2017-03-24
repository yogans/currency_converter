/* AngularJS currency converter module definition */
var app = angular.module('currencyConverter',[]);

/* Service to get latest currency rates */
app.factory('fixerIO',['$http','$q',function($http,$q){
    return {
        getFixerRates : function(url){
            var defer = $q.defer();
            $http.get(url).then(function(response){
                defer.resolve(response.data.rates);
            },function(){
                defer.reject();
            });
            return defer.promise;
        }
    };
}]);

/* Converter controller definition */
app.controller('converter',['$scope','fixerIO',function($scope,fixerIO){
    
    /* Initialization method */
    $scope.init = function(){
        $scope.currencies = ["CAD","USD","EUR"];
        $scope.fromCurrency = $scope.currencies[0];
        $scope.toCurrency = $scope.currencies[1];
    }

    $scope.init();
    
    /* Service call to get latest exchange rates from fixer.io */
    fixerIO.getFixerRates("http://api.fixer.io/latest?symbols="+$scope.currencies.join(',')).then(function(data){
        data.EUR = 1;
        $scope.fixerRates = data;
        $scope.$broadcast('exchangeData',data);
    });

    /* onFocus event handler to capture last changed element in DOM */
    $scope.selectFocus = function($event){
        if($event.target != null){
            $scope.triggeredElement = $event.target;
        }
    };

    /* main method for converting currency values from one to other */
    $scope.calculate = function(){
        $scope.toValue = (parseFloat($scope.fromValue) * $scope.fixerRates[$scope.toCurrency]) / $scope.fixerRates[$scope.fromCurrency];
        if(isNaN($scope.toValue)){
            $scope.toValue = "0.00";
        }
        else{
            $scope.toValue = $scope.toValue.toFixed(2);
        }
    };

    /* Validate method to allow only numbers in input text fields */
    $scope.validate = function(e){
        var key = e.keyCode ? e.keyCode : e.which;
        var elemValue = e.target.value;

        /* validation to accept only one period & only two numbers after a period */
        if((((key >= 48 && key <= 57) || (key == 110 || key == 190) || (key >= 96 && key <= 105)) && elemValue.length < 10) || key == 8){
            if((elemValue.match(/\./) && (elemValue.split('.').length<3 && elemValue.split('.')[1].length <2) && key!= 110 && key != 190) ||  key == 8){
                $scope.calculate();
            }
            else if(elemValue.match(/\./) && (key == 110 || key == 190) || (elemValue.match(/\./) && (elemValue.split('.').length < 3 && elemValue.split('.')[1].length >= 2))){
                e.preventDefault();
            }
            else{
                $scope.calculate();
            }
        }
        else{
            e.preventDefault();
        }
    };

}]);

app.controller('rates',['$scope','fixerIO',function($scope,fixerIO){

    $scope.currencies = ["CAD","USD","EUR"];

    /* Service call to get latest exchange rates from fixer.io */
    fixerIO.getFixerRates("http://api.fixer.io/latest?symbols="+$scope.currencies.join(',')).then(function(data){
        data.EUR = 1;
        $scope.exchangeData = data;
    });

}]);
