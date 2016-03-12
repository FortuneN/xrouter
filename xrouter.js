angular.module('xroute', []).provider('xroute', function () {
	
	//fields
	
	var routes = {};
	var stack = [];
	var currentRoute = null;
	
	//methods
	
	function getQueryParameters(url) {
		if (!url || url.indexOf('?') == -1) return {};
		var qs = url.substring(url.indexOf('?') + 1).split('&');
		for (var i = 0, result = {}; i < qs.length; i++) {
			qs[i] = qs[i].split('=');
			result[qs[i][0]] = decodeURIComponent(qs[i][1]);
		}
		return result;
	};
	
	function addOrGetRoute(path) {
		var route = routes[path];
		if (path && !route) {
			var indexOfQ = path.indexOf('?');
			if (indexOfQ != -1) path = path.substr(0, indexOfQ);
			route = routes[path] = { controller: path, templateUrl: path };
		}
		return route;
	};
	
	//public
	
	this.$get = function () {
		return {
			goto: function (path, parameters) {
				if (!path || path == currentRoute.templateUrl) return;
				if (path.indexOf(' ') != -1) throw 'Spaces are not allowed in page/route names';
				var route = addOrGetRoute(path);
				var xparameters = getQueryParameters(path);
				if (typeof parameters == 'string') for (var prop in parameters) xparameters[pop] = parameters[prop];
				stack.forEach(function (callback) { callback(route, currentRoute, xparameters) });
				currentRoute = route;
			},
			onRouteChange: function (callback) {
				stack.push(callback);
			},
			getCurrentRoute: function () {
				return currentRoute;
			},
		};
	};
	
	//init with default route
	
	currentRoute = addOrGetRoute('xindex.html');
})

.directive('xview', function ($controller, xroute) {
	return {
		template: '<div ng-include="templatePath"></div>',
		link: function ($scope) {
			
			$scope.xgoto = xroute.goto;
			
			xroute.onRouteChange(function (newRoute, oldRoute, xparameters) {
				
				$scope.templatePath = newRoute.templateUrl;
				
				try {
					$controller(newRoute.controller, { '$scope': $scope, 'xparameters': xparameters, 'xgoto': xroute.goto });
				} catch (e) {
					var errorStr = (e + '');
					if (errorStr.indexOf('Error: [ng:areq] Argument') != -1 && errorStr.indexOf('is not a function, got undefined') != -1) {
						xroute.goto('x404.html');
					} else {
						throw e;
					}
				}
			});
			
			var currentRoute = xroute.getCurrentRoute();
			if (currentRoute) xroute.goto(currentRoute.templateUrl);
		}
	};
})

.directive("xhref", function ($compile, $parse) {
	return {
		priority: 1001, // compiles first
		terminal: true, // prevent lower priority directives to compile after it
		compile: function (element) {
			
			var stringValue = element.attr('xhref');
			var parsedValue; try { var parsedValue = $parse(stringValue)(); } catch (e) { }
			stringValue = ((parsedValue || stringValue) + '').replace("'", "\'");
			
			element.removeAttr('xhref');
			element.attr('href', '#');
			element.attr('ng-click', "xgoto('" + stringValue + "')");
			
			var fn = $compile(element);
			return function (scope) { fn(scope); };
		}
	};
});
