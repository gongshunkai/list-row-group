(function(window, angular) {

    'use strict';

    var myPromise = {
        then: (function (data) {
            return function (callback) {
                callback.call(window, data);
                return myPromise;
            };
        })(myPromise),
        catch: (function (data) {
            return function (callback) {
                callback.call(window, data);
                return myPromise;
            };
        })(myPromise),
        finally: (function (data) {
            return function (callback) {
                callback.call(window, data);
                return myPromise;
            };
        })(myPromise)
    };

    var listGroup = {

        restrict:'AE',  
        require: '^listRowGroup',
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'list-group-item.html';
        },
        replace:true,
        scope:{
            header:'@',
            text:'@',
            value:'@',
            source:'=',
            multiple:'=',
            selected:'&'
        },
        link:function(scope, element, attrs, listRowGroupCtrl){

            scope.$selected = function(i){

                if(scope.multiple){
                    if(scope.active[i]){
                        scope.active[i] = false;
                    }else{
                        scope.active[i] = true;
                    }
                }else{    
                    angular.forEach(scope.source,function(item,index){
                        scope.active[index] = false;
                    });

                    scope.active[i] = true;
                }   

                scope.selected({item:scope.source[i],index:i,active:scope.active[i]});
            };
        }
    };

    angular.module('listRowGroup', [])

    .directive('listRowGroup', function() {

        return {
            restrict:'AE',  
            transclude:{
                'source':'listGroupSource',
                'extra':'formGroupExtra',
                'target':'listGroupTarget'
            },  
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || 'list-row-group.html';
            },
            replace:true,
            scope:{
                addItem:'&',
                dropItem:'&'
            },
            controller:['$scope',function($scope){

                var source = {};

                var target = {};

                this.getText = function(){
                    return $scope.text;
                };

                this.setSource = function(key,value){
                    source[key] = value;
                };

                this.setTarget = function(key,value){
                    target[key] = value;
                };

                this.setDoubleAngle = function(type,mode){
                    $scope['showDoubleAngle' + type] = mode;
                };

                this.addItem = function(type){
                    $scope.$addItem(type);
                };

                this.dropItem = function(type){
                    $scope.$dropItem(type);
                };

                $scope.$addItem = function(type){
                    
                    var cache = {};
                    var items = [];

                    angular.forEach(target.data,function(item){
                        var id = item[target.val];
                        cache[id] = true;
                    });

                    angular.forEach(source.data,function(item,index){

                        var id = item[source.val];
                            item = angular.copy(item);

                        if((function(){
                            if(type == 'all'){
                                if(!cache[id]){
                                    return true;
                                }
                            }else{
                                if(source.act[index] && !cache[id]){
                                    return true;
                                }
                            }
                        })()){        
                            items.push(item);
                        }
                    });

                    $scope.loading = true;

                    var promise = $scope.addItem({items:items}) || {};
                    
                    (promise = promise.then ? promise : angular.extend({},myPromise))
                    .then(function (data) {
                        angular.forEach(items,function(item){
                            target.data.push(item);
                        });
                    })
                    .catch(function(data){
                        //待实现
                    })
                    .finally(function(data){
                        $scope.loading = false;
                    });
                };

                $scope.$dropItem = function(type){

                    var values = [];
                    var indexes = [];

                    angular.forEach(target.data,function(item,index){
                        if(type == 'all' || target.act[index]){
                            values.push(target.data[index][target.val]);
                            indexes.unshift(index);
                        }
                    });

                    $scope.loading = true;

                    var promise = $scope.dropItem({values:values}) || {};
                    
                    (promise = promise.then ? promise : angular.extend({},myPromise))
                    .then(function (data) {

                       angular.forEach(indexes,function(index){
                            target.data.splice(index,1);
                            target.act[index] = false;
                        });

                    })
                    .catch(function(data){
                        //待实现
                    })
                    .finally(function(data){
                        $scope.loading = false;
                    });
                };
            }]
        }
    })

    .directive('listGroupSource',function(){

        return angular.extend({},listGroup,{

            link:function(scope, element, attrs, listRowGroupCtrl){

                listRowGroupCtrl.setSource('act',scope.active = []);
                listRowGroupCtrl.setSource('val',scope.value);
                listRowGroupCtrl.setDoubleAngle('Right',scope.multiple);

                scope.$watch('source',function(){       
                    angular.forEach(scope.source,function(item,index){
                        scope.active[index] = false;
                    });
                    listRowGroupCtrl.setSource('data',scope.source);  
                });

                scope.$dblSelected = function(i){
                    angular.forEach(scope.source,function(item,index){
                        scope.active[index] = false;
                    });
                    scope.active[i] = true;
                    listRowGroupCtrl.addItem();
                };

                listGroup.link(scope, element, attrs, listRowGroupCtrl);
            }
        });

    })

    .directive('listGroupTarget',function(){

        return angular.extend({},listGroup,{
            
            link:function(scope, element, attrs, listRowGroupCtrl){

                listRowGroupCtrl.setTarget('act',scope.active = []);
                listRowGroupCtrl.setTarget('val',scope.value);
                listRowGroupCtrl.setDoubleAngle('Left',scope.multiple);
                
                scope.$watch('source',function(){
                    listRowGroupCtrl.setTarget('data',scope.source);
                });

                scope.$dblSelected = function(i){
                    angular.forEach(scope.source,function(item,index){
                        scope.active[index] = false;
                    });
                    scope.active[i] = true;
                    listRowGroupCtrl.dropItem();
                };

                listGroup.link(scope, element, attrs, listRowGroupCtrl);
            }
        });

    })

    .run(["$templateCache", function($templateCache) {
        $templateCache.put("list-row-group.html",
        "<div class=\"list-row-group\">\n" +
        "  <div class=\"col-xs-5\">\n" +
        "      <div ng-transclude=\"source\"></div>\n" +
        "  </div>\n" +
        "  <div class=\"col-xs-2\">\n" +
        "    <div ng-transclude=\"extra\"></div>\n" +
        "    <div class=\"form-group\">\n" +
        "      <div class=\"btn-group-vertical btn-block\" role=\"group\">\n" +
        "        <button type=\"button\" class=\"btn btn-primary\" ng-if=\"showDoubleAngleRight\" ng-click=\"$addItem('all')\" ng-disabled=\"loading\"><i class=\"icon-double-angle-right\"></i></button>\n" +
        "        <button type=\"button\" class=\"btn btn-info\" ng-click=\"$addItem()\" ng-disabled=\"loading\"><i class=\"icon-angle-right\"></i></button>\n" +
        "        <button type=\"button\" class=\"btn btn-info\" ng-click=\"$dropItem()\" ng-disabled=\"loading\"><i class=\"icon-angle-left\"></i></button>\n" +
        "        <button type=\"button\" class=\"btn btn-primary\" ng-if=\"showDoubleAngleLeft\" ng-click=\"$dropItem('all')\" ng-disabled=\"loading\"><i class=\"icon-double-angle-left\"></i></button>\n" +
        "      </div>\n" +
        "    </div>\n" +
        "  </div>\n" +
        "  <div class=\"col-xs-5\">\n" +
        "      <div ng-transclude=\"target\"></div>\n" +
        "  </div>\n" +
        "</div>\n" +
        "");
    }])

    .run(["$templateCache", function($templateCache) {
        $templateCache.put("list-group-item.html",
        "    <div class=\"list-group-wrapper\">\n" +
        "      <div class=\"list-group-header\">{{header}}</div>\n" +
        "        <div class=\"list-group\">\n" +
        "          <a href=\"\" class=\"list-group-item\" ng-class=\"{'list-group-item-warning':active[$index]}\" ng-click=\"$selected($index)\" ng-Dblclick=\"$dblSelected($index)\" ng-repeat=\"item in source\">{{item[text]}}</a>\n" +
        "      </div>\n" +
        "    </div>\n" +
        "");
    }]);

})(window, window.angular);
