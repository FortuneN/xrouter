# xrouter
An angular router that does not use #/url for page change and does not require route configuration.

Good for when you writing a componet to fit into a page that you don't own (or have control over) such that you have all the goodness of angular without fiddling the url.


## Usage

index.html
```
<html>
	<head>
		<title>xrouter</title>
		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.0/angular.js"></script>
		<script type="text/javascript" src="https://rawgit.com/FortuneN/xrouter/master/xrouter.js"></script>
		<script type="text/javascript">
			var app = angular.module('app', ['xroute']);
		</script>
	</head>
	<body ng-app="app">
		<h1>Xrouter Demo</h1>
		<a xhref="xindex.html">xindex.html</a> | <a xhref="home.html?a=b">home.html</a> | <a href="#" ng-click="xgoto('about.html')">about.html</a> | <a href="#" ng-click="xgoto('contacts.html?c=d')">contacts.html</a> | <a xhref="nowhere">no where</a>
		<div xview></div>
	</body>
</html>
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
