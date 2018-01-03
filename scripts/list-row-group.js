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
                    scope.active[i] = !scope.active[i]; 
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

                var vm = this;

                //setSource setTarget
                angular.forEach(['Source','Target'],function(n){
                    vm['set' + n] = function(key,value){
                        if(typeof key === 'object'){
                            angular.forEach(key,function(v,k){
                                vm['set' + n](k,v);
                            });
                        }else{
                            $scope['$' + n.toLowerCase()][key] = value;
                        }
                    };
                });

                //addItem dropItem
                angular.forEach(['add','drop'],function(n){
                    vm[n + 'Item'] = function(type){
                        $scope['$' + n + 'Item'](type);
                    };
                });

                //setDoubleAngleLeft setDoubleAngleRight
                angular.forEach(['Left','Right'],function(n){
                    vm['setDoubleAngle' + n] = function(mode){
                        $scope['showDoubleAngle' + n] = mode;
                    };
                });

                $scope.$source = {};

                $scope.$target = {};

                $scope.$addItem = function(type){
                    
                    var cache = {};
                    var items = [];

                    angular.forEach($scope.$target.data,function(item){
                        var id = item[$scope.$target.val];
                        cache[id] = true;
                    });

                    angular.forEach($scope.$source.data,function(item,index){

                        var id = item[$scope.$source.val],
                            newItem = angular.copy(item);

                        if((function(){
                            if(type == 'all'){
                                if(!cache[id]){
                                    return true;
                                }
                            }else{
                                if($scope.$source.act[index] && !cache[id]){
                                    return true;
                                }
                            }
                        })()){

                            //sourcelist与targetlist的字段映射不相同需要做转换
                            //
                            if($scope.$source.val != $scope.$target.val){
                                newItem[$scope.$target.val] = item[$scope.$source.val];
                                delete newItem[$scope.$source.val];
                            }

                            if($scope.$source.name != $scope.$target.name){
                                newItem[$scope.$target.name] = item[$scope.$source.name];
                                delete newItem[$scope.$source.name];
                            }
                          
                            items.push(newItem);
                        }
                    });

                    $scope.loading = true;

                    var promise = $scope.addItem({items:items}) || {};
                    
                    (promise = promise.then ? promise : angular.extend({},myPromise))
                    .then(function (data) {
                        angular.forEach(items,function(item){
                            $scope.$target.data.push(item);
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

                    angular.forEach($scope.$target.data,function(item,index){
                        if(type == 'all' || $scope.$target.act[index]){
                            values.push($scope.$target.data[index][$scope.$target.val]);
                            indexes.unshift(index);
                        }
                    });

                    $scope.loading = true;

                    var promise = $scope.dropItem({values:values}) || {};
                    
                    (promise = promise.then ? promise : angular.extend({},myPromise))
                    .then(function (data) {

                       angular.forEach(indexes,function(index){
                            $scope.$target.data.splice(index,1);
                            $scope.$target.act[index] = false;
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

                listRowGroupCtrl.setSource({
                    'act':scope.active = [],
                    'val':scope.value,
                    'name':scope.name
                });

                listRowGroupCtrl.setDoubleAngleRight(scope.multiple);

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

                listRowGroupCtrl.setTarget({
                    'act':scope.active = [],
                    'val':scope.value,
                    'name':scope.name
                });

                listRowGroupCtrl.setDoubleAngleLeft(scope.multiple);
                
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
