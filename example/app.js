angular.module('app', ['xroute'])

.controller('xindex.html', function ($scope, xparameters) {
	console.log('xparameters: ', xparameters);
	$scope.title = 'xindex.html';
})

.controller('x404.html', function ($scope, xparameters) {
	console.log('xparameters: ', xparameters);
	$scope.title = 'x404.html';
})

.controller('home.html', function ($scope, xparameters) {
	console.log('xparameters: ', xparameters);
	$scope.title = 'home.html';
})

.controller('about.html', function ($scope, xparameters) {
	console.log('xparameters: ', xparameters);
	$scope.title = 'about.html';
})

.controller('contacts.html', function ($scope, xparameters) {
	console.log('xparameters: ', xparameters);
	$scope.title = 'contacts.html';
});