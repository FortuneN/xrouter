angular.module('xroute', []).provider('xroute', function ($controllerProvider) {
	
	//fields
	
	var routes = {};
	var routeChangeCallbacks = [];
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
	
	function loadScript(url, callback)  {
		
		// Adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		
		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.
		script.onreadystatechange = callback;
		script.onload = callback;
		
		// Fire the loading
		head.appendChild(script);
	};
	
	function registerController(controllerName) {
		// Here I cannot get the controller function directly so I
		// need to loop through the module's _invokeQueue to get it
		var moduleName = 'app'; //TODO: get module name dynamically/automatically
		var queue = angular.module(moduleName)._invokeQueue;
		for (var i = 0; i < queue.length; i++) {
			var call = queue[i];
			if (call[0] == "$controllerProvider" && call[1] == "register" && call[2][0] == controllerName) {
				$controllerProvider.register(controllerName, call[2][1]);
			}
		}
	};
	
	function addOrGetRoute(path, callback) {
		
		if (!path) throw 'path is required';
		if (path.indexOf(' ') != -1) throw 'spaces are not allowed in page/route names';
		
		var indexOfQ = path.indexOf('?');
		if (indexOfQ != -1) path = path.substr(0, indexOfQ);
		
		var route = routes[path];
		if (route) return callback && callback(route);
		
		loadScript(path + '.js', function() {
			registerController(path);
			route = routes[path] = { controller: path, templateUrl: path };
			return callback && callback(route);
		});
	};
	
	//public
	
	this.$get = function () {
		return {
			goto: function (path, parameters) {
				addOrGetRoute(path, function(route) {
					
					var xparameters = getQueryParameters(path);
					if (typeof parameters == 'object') {
						for (var prop in parameters) {
							xparameters[pop] = parameters[prop];
						}
					}
					
					routeChangeCallbacks.forEach(function (callback) {
						callback(route, currentRoute, xparameters);
					});
					
					currentRoute = route;
				});
			},
			onRouteChange: function (callback) {
				if (typeof callback == 'function') {
					routeChangeCallbacks.push(callback);
				}
			},
			getCurrentRoute: function () {
				return currentRoute;
			},
		};
	};
})

.directive('xview', function ($controller, xroute) {
	return {
		template: '<div ng-include="templatePath"></div>',
		link: function ($scope) {
			
			//expose xgoto on $scope
			
			$scope.xgoto = xroute.goto;
			
			//what to do when route changes
			
			var pending404 = false;
			xroute.onRouteChange(function (newRoute, oldRoute, xparameters) {
				
				$scope.templatePath = newRoute.templateUrl;
				
				try {
					$controller(newRoute.controller, { '$scope': $scope, 'xparameters': xparameters, 'xgoto': xroute.goto });
					pending404 = false;
				} catch (e) {
					var errorStr = (e + '');
					if (errorStr.indexOf('Error: [ng:areq] Argument') != -1 && errorStr.indexOf('is not a function, got undefined') != -1) {
						if (!pending404) {
							pending404 = true;
							xroute.goto('x404.html');
						}
					} else {
						throw e;
					}
				}
			});
			
			//set first page/route
			
			var currentRoute = xroute.getCurrentRoute();
			if (currentRoute) xroute.goto(currentRoute.templateUrl);
			else xroute.goto('xindex.html');
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
