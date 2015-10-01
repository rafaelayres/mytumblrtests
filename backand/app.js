(function(){
    angular.module('myApp',['backand']);    
    
    
    //Update Angular configuration section
    angular.module('myApp').config(function (BackandProvider) {
        BackandProvider.setAppName('rtatumblr');
        //BackandProvider.setSignUpToken('482f75d3-f1ab-4d2c-a3e9-f356169be5eb');
        BackandProvider.setAnonymousToken('e22907a5-b4d2-4edc-a5ed-8845dc4fd276');
    });
    
    angular.module('myApp').controller('myCtrl',function(Backand,$scope,$http,backndAPI,tumblrAPI){
        
        $scope.blogsBA = [];
        $scope.relationsBA = [];
        
        backndAPI.getBlogs().success(function(response){
            
            for(var i in response.data){
                blogToScope(response.data[i]);
            }
        }).error(function(response){
            console.log(response);
        });
        
        backndAPI.getRelations().success(function(response){
            for(var i in response.data){
                var relation = {};
                
                relation.followed = response.data[i].__metadata.descriptives.followed.label;
                relation.follower = response.data[i].__metadata.descriptives.follower.label;
                relation.inserted = true;
                
                $scope.relationsBA.push(angular.copy(relation));
            }   
        }).error(function(response){
            console.log(response); 
        });
        
        $scope.analyzeRelations = function(){
            insertRelations();
        };
        
        $scope.analyze = function(blog){
            tumblrAPI.getPosts(blog.name).success(function(data){
                var posts = data.response.posts;
                
                for (var i in posts){
                    var reblogRoot = posts[i].reblogged_root_name;
                    var reblogFrom = posts[i].reblogged_from_name;
                    var blog = posts[i].blog_name;
                    var notes = posts[i].notes;
                    
                    if(reblogRoot!= "" && reblogRoot != undefined){
                        if(reblogRoot !== blog) {processPair(reblogRoot,blog);}
                        if(reblogRoot !== reblogFrom) {processPair(reblogRoot,reblogFrom);}
                        if(reblogFrom !== blog){processPair(reblogFrom,blog);}
                        
                        for(var j in notes){
                            var notesBlog = notes[j].blog_name;
                            
                            processPair(reblogRoot,notesBlog);
                        }
                        
                    }
                    else{
                        for(var k in notes){
                            var notesBlog2 = notes[k].blog_name;
                            
                            processPair(blog,notesBlog2);
                        }
                    }
                }
                
                checkUnMappedBlogs();
                
            });
        };
        
        $scope.countFollowers = function(blog){
            
            var count = 0;
            
            if(blog.followers != ""){
                count = blog.followers.split(",").length;
            }
            
            return count;
        };
        
        var checkUnMappedBlogs = function(){
            var followers = $scope.relationsBA.map(function(el){
                return el.follower;
            });
            
            var following = $scope.relationsBA.map(function(el){
                return el.followed;
            });
            
            var blogs = followers;
            
            blogs.concat(following);
            
            var reduced = blogs.reduce(function(accum, current) {
                if (accum.indexOf(current) < 0) {
                    accum.push(current);
                }
                return accum;
            }, []);
            
            reduced.forEach(function(blog){
                if(!verifyBlog(blog)){
                    insertNewBlog(blog);   
                }
            });
        };
        
        var blogToScope = function(newBlog){
            var blog = {};
                
            blog.id = newBlog.id;
            blog.name = newBlog.name;
            blog.followers = newBlog.followers;
            blog.analyzed = newBlog.analyzed;
            blog.updated = true;
            blog.inserted = true;
            
            $scope.blogsBA.push(angular.copy(blog));    
        };
        
        var processPair = function(followed, follower){
            //Verifica se o par existe
            if(!verifyPair(followed,follower)){
                var pair = {};
                pair.followed = followed;
                pair.follower = follower;
                pair.inserted = false;
                
                $scope.relationsBA.push(pair);
            }
        };
        
        var insertNewBlog = function(name){
            backndAPI.createBlog(name, false).success(function(data){
                blogToScope(data);
                
                if(verifyPairXBlogs()){
                    insertRelations();
                }
                
            });
        };
        
        var verifyPairXBlogs = function(){
            return $scope.relationsBA.every(function(el){
                return verifyBlog(el.follower) && verifyBlog(el.followed);
            });
        };
        
        var insertRelations = function(){
            $scope.relationsBA.forEach(function(el){
                if(el.inserted === false){
                    
                    var followed = getBlogID(el.followed);
                    var follower= getBlogID(el.follower);
                    
                    
                    backndAPI.createRelations(followed,follower).success(function(data){
                        el.inserted = true;
                    });    
                }
            });
        };
        
        var getBlogID = function(blogName){
            var blogs = $scope.blogsBA.filter(function(el){
                return el.name == blogName;
            });
            
            return blogs[0].id;
        };
        
        var verifyPair = function(followed,follower){
            
            return $scope.relationsBA.some(function(el){
                return el.followed == followed && el.follower == follower;
            });
            
        };
        
        var verifyBlog = function(blogName){
            return $scope.blogsBA.some(function(el){
                return el.name == blogName;
            });
        };
        
    });
    
    
    angular.module('myApp').factory("tumblrAPI",function($http){
    
        var baseUrl = 'http://api.tumblr.com/v2/blog/';
        var apiKey = '?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY';
        var blogBase = ".tumblr.com";
        var typePost = "&type=photo";
        var callback = "&callback=JSON_CALLBACK";
        
        var _getLikes = function(blogName){
            
            var call = baseUrl + blogName + blogBase +"/likes"+ apiKey + typePost + callback;
            
            return $http.jsonp(call);
        };
        
        var _getInfo = function(blogName){
            var call = baseUrl + blogName + blogBase + "/info" + apiKey + callback;
            
            return $http.jsonp(call);
        };
        
        var _getPosts = function(blogName){
            
            var reblogInfo = "&reblog_info=true";
            var notesInfo = "&notes_info=true";
            
            var call = baseUrl + blogName + blogBase + "/posts" + apiKey + typePost + reblogInfo + notesInfo + callback;
            
            return $http.jsonp(call);
        };
        
        return {
            getLikes : _getLikes,
            getInfo  : _getInfo,
            getPosts : _getPosts
    };
    
});
    
    angular.module('myApp').factory("backndAPI",function($http,Backand){
        
        var _getBlogs = function(){
            return $http({
                method: 'GET',
                url: Backand.getApiUrl() + '/1/objects/blogs?pageSize=10000',
            });
        };
        
        var _getRelations = function(){
            return $http({
                method: 'GET',
                url: Backand.getApiUrl() + '/1/objects/relations?pageSize=10000',
            });
        };
        
        var _createBlog = function(name, analyzed){
            var blog = {};
            blog.name = name;
            blog.analyzed = analyzed;
            
            return $http({
                method: 'POST',
                url : Backand.getApiUrl() + '/1/objects/blogs',
                data: blog,
                params: {
                    returnObject: true
                }
            });
        };
        
        var _createRelations = function(followed,follower){
            var relation = {};
            relation.followed = followed;
            relation.follower = follower;
            
            return $http({
                method: 'POST',
                url : Backand.getApiUrl() + '/1/objects/relations?pagesize=10000',
                data: relation,
                params: {
                    returnObject: true
                }
            });
        };
        
        return {
            getBlogs : _getBlogs,
            getRelations : _getRelations,
            createBlog : _createBlog,
            createRelations : _createRelations
        };
    });
})();


