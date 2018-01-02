# list-row-group
angular组件 - 模拟两个多选select(multiple左右)添加、删除选项和取值

## 配置
在html头部引用：  
```
    list-row-group.css
    list-row-group.min.js
```
## 使用
list-row-group的属性和方法：
value 映射数据源id字段名
text 映射数据源文本字段名
template-url 模板地址
add-item 添加项目的回调方法，该方法有1个参数，包含：待添加项的数据集合，如需处理异步请求，请返回一个promise对象。
drop-item 删除项目的回调方法，该方法有1个参数，包含：待删除项的id数组，如需处理异步请求，请返回一个promise对象。

list-group-source的属性和方法：
header 列表的标题
source 列表的数据源
multiple 是否多选
template-url 模板地址
selected 选中项目的回调方法，该方法有3个参数，包含：选中项数据、选中项索引值、选中项是否激活

list-group-target的属性和方法：
header 列表的标题
source 列表的数据源
multiple 是否多选
template-url 模板地址
selected 选中项目的回调方法，该方法有3个参数，包含：选中项数据、选中项索引值、选中项是否激活

```html
<list-row-group value="id" text="name" add-item="addItem(items)" drop-item="dropItem(values)">
	<list-group-source header="标题" source="sourcelist" selected="selected(item,index,active)"></list-group-source>
	<form-group-extra>
		...
	</form-group-extra>
	<list-group-target header="标题" source="targetlist" multiple="true"></list-group-target>
</list-row-group>

```

```javascript
var app = angular.module('myApp', ['listRowGroup']);
app.controller('myCtrl', ['$scope','$http','$q',function($scope,$http,$q) {

	$scope.sourcelist = [];
	$scope.targetlist = [];
	
	$scope.selected = function(item,index,active){
		....
	};

	$scope.addItem = function(items){
		....
	};

	$scope.dropItem = function(values){

		//如需处理异步请求，请返回一个promise对象
		//这样做的好处是数据库删除成功才会删除列表中的选中项（添加/删除列表中的数据由组件完成，用户只需关心与后端的交互），否则处理错误的回调方法。 

		var deferred = $q.defer();
		
		//向后端请求删除数据
		$http.post('...',data)
		.success(function(data){
			alert('删除的id: ' + values);
			deferred.resolve(data);
		})
		.error(function(msg){
			deferred.reject(msg);
		});

		return deferred.promise;
	};

}]);
```
