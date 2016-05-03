//a way to obtain all the registered modules

(function(angular_module) {
	angular._xrouter_modulenames_ = [];
	angular.module = function() {
		if (arguments.length > 1) {
			angular._xrouter_modulenames_.push(arguments[0]);
		}
		return angular_module.apply(null, arguments);
	};
})(angular.module);

//xroute declaration begins here

angular.module('xroute', []).provider('xroute', function($controllerProvider) {

	//fields

	var routes = {};
	var beforeRouteChangeCallbacks = [];
	var afterRouteChangeCallbacks = [];
	var changeRoute = null;
	var currentRoute = null;

	//methods

	function getQueryParameters(url) {
		if (!url || url.indexOf('?') == -1)
			return {};
		var qs = url.substring(url.indexOf('?') + 1).split('&');
		for (var i = 0, result = {}; i < qs.length; i++) {
			qs[i] = qs[i].split('=');
			result[qs[i][0]] = decodeURIComponent(qs[i][1]);
		}
		return result;
	};

	function loadScript(url, callback) {

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
		for (var mi = 0; mi < angular._xrouter_modulenames_.length; mi++) {
			var queue = angular.module(angular._xrouter_modulenames_[mi])._invokeQueue;
			for (var i = 0; i < queue.length; i++) {
				var call = queue[i];
				if (call[0] == "$controllerProvider" && call[1] == "register" && call[2][0] == controllerName) {
					return $controllerProvider.register(controllerName, call[2][1]);
				}
			}
		}
	};

	function addOrGetRoute(path, callback) {

		if (!path) {
			throw 'path is required';
		}
		if (path.indexOf(' ') != -1) {
			throw 'spaces are not allowed in page/route names';
		}

		var indexOfQ = path.indexOf('?');
		if (indexOfQ != -1) {
			path = path.substr(0, indexOfQ);
		}

		var route = routes[path];
		if (route) {
			return callback(route);
		}

		loadScript(path + '.js', function() {
			registerController(path);
			route = routes[path] = {
				controller : path,
				templateUrl : path
			};
			callback(route);
		});
	};

	//public

	this.$get = function() {
		return {
			goto : function(path, parameters) {
				addOrGetRoute(path, function(route) {

					//combine query string parameters and object parameters

					var xparameters = getQueryParameters(path);
					if ( typeof parameters == 'object') {
						for (var prop in parameters) {
							xparameters[prop] = parameters[prop];
						}
					}

					//execute route change, with before and after invocations

					var _route = route, _currentRoute = currentRoute;
					beforeRouteChangeCallbacks.forEach(function(callback) {
						callback(_route, _currentRoute, xparameters);
					});
					changeRoute(_route, _currentRoute, xparameters);
					currentRoute = _route;
					afterRouteChangeCallbacks.forEach(function(callback) {
						callback(_route, _currentRoute, xparameters);
					});
				});
			},
			beforeRouteChange : function(callback) {
				if ( typeof callback == 'function') {
					beforeRouteChangeCallbacks.push(callback);
				}
			},
			afterRouteChange : function(callback) {
				if ( typeof callback == 'function') {
					afterRouteChangeCallbacks.push(callback);
				}
			},
			_changeRoute : function(ffunctionn) {
				if ( typeof ffunctionn == 'function') {
					changeRoute = ffunctionn;
				}
			},
			getCurrentRoute : function() {
				return currentRoute;
			},
		};
	};
}).directive('xview', function($controller, $timeout, xroute) {
	return {
		template : '<div ng-include="templateUrl"></div>',
		link : function($scope, element, attrs) {

			//expose xgoto on $scope

			$scope.xgoto = xroute.goto;

			//what to do when route changes

			var pending404 = false;
			xroute._changeRoute(function(newRoute, oldRoute, xparameters) {
				try {
					$scope.templateUrl = newRoute.templateUrl;
					$timeout(function() {
						$controller(newRoute.controller, {
							'$scope' : $scope,
							'xparameters' : xparameters,
							'xgoto' : xroute.goto
						});
						pending404 = false;
					});
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

			xroute.goto(attrs.xview ? attrs.xview : 'xindex.html');
		}
	};
}).directive("xhref", function($compile, $parse) {
	return {
		priority : 1001, // compiles first
		terminal : true, // prevent lower priority directives to compile after it
		compile : function(element) {

			var stringValue = element.attr('xhref');
			var parsedValue;
			try {
				var parsedValue = $parse(stringValue)();
			} catch (e) {
				//ignore
			}
			stringValue = ((parsedValue || stringValue) + '').replace("'", "\'");

			element.removeAttr('xhref');
			element.attr('href', '#');
			//element.attr('ng-click', "xgoto('" + stringValue + "')");
			element.attr('ng-mousedown', "xgoto('" + stringValue + "')");

			var fn = $compile(element);
			return function(scope) {
				fn(scope);
			};
		}
	};
});
