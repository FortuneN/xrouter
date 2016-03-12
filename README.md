# xrouter
An angular router that does not use #/url for page change and does not require route configuration.

Good for when you writing a componet to fit into a page that you don't own (or have control over) such that you have all the goodness of angular without fiddling the url.


## Usage

index.html
```
<html>
  <head>
    <title>xrouter</title>
    <script type="text/javascript" src="angular.js"></script>
    <script type="text/javascript" src="../xrouter.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </head>
  <body ng-app="app">
    <h1>Xrouter test</h1>
    <a xhref="xindex.html">xindex.html</a> | <a xhref="home.html?a=b">home.html</a> | <a ng-click="xgoto('about.html')">about.html</a> | <a ng-click="xgoto('contacts.html?c=d')">contacts. | <a xhref="no where">no where</a>html</a> 
    <div xview></div>
  </body>
</html>
```

app.js
```
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
```

### xview
This is where the templates come in

```
<div xview></div>
```

### xhref
This is how to do hyperlinks

```
<a xhref="xindex.html">xindex.html</a> | <a xhref="home.html?a=b">home.html</a>
```


### xrouter.goto
Inject xrouter into your controller and call the goto method.
The method takes a url (which can include a query string) and an object (optinal) as parameters.

```
app.controller('home.html', function($scope, xrouter) {
 ...
 xrouter.goto('about.html?a=b', {c:d});
 ...
})
```


### xgoto
Inject xgoto into your controller and execute the method.

```
app.controller('home.html', function($scope, xgoto) {
 ...
 xgoto('about.html?a=b', {c:d});
 ...
})
```


### xparameters
Inject xparameters into your controller to access the parameters for your page

```
app.controller('home.html', function($scope, xparameters) {
 ...
})
```

## Notes
- The default route/page is xindex.html
- If any page is not found (including xindex.html), the x404.html route/page is shown
- The controllers are named the same as the page e.g. app.controller('home.html', function($scope) { ... });

## Credits
- Stack Overflow : <a href="http://stackoverflow.com/questions/26632909/change-view-and-controller-without-updating-url-or-history" target="_blank">change view and controller without updating url or history</a>
- Stack Overflow : <a href="http://stackoverflow.com/questions/15250644/loading-an-angularjs-controller-dynamically" target="_blank">loading an angularjs controller dynamically</a>

## TODO
- have *.js files put in the same folder as *.html files
- allow user to change default files 'xindex.html' and 'x404.html'
- allow user to specify a base path for urls
