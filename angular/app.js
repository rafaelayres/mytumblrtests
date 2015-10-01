angular.module('BlogsSimilares',[]);

angular.module('BlogsSimilares').controller("BlogsCtrl",function($scope,tumblrAPI){
    
    $scope.myBlogs = getMyBlogs();
    
    $scope.getBlogInfo = function(blogName){
        tumblrAPI.getInfo(blogName).success(function(data){
            updateBlogs(data.response.blog);
            
            updateRelCount();
        
            $scope.myBlogs = getMyBlogs();
        });
    };
    
    $scope.updateAll = function(){
        var _blogs = angular.copy($scope.myBlogs);
        
        for(var i in _blogs){
            if(_blogs[i].share_likes){
                if(_blogs[i].likes > _blogs[i].avlikes){
                    $scope.getLikes(_blogs[i].name,_blogs[i].avlikes);
                }
            }
        }
        
    };
    
    $scope.getLikes = function(blogName, offset){
        tumblrAPI.getLikes(blogName,offset).success(function(data){
            blog = getBlog(blogName);
            
            blog[0].likes = data.response.liked_count;
            
            var likes = data.response.liked_posts;
            
            blog[0].avlikes += likes.length;
            
            for(var i in likes){
                if(!existeRelacao(likes[i].blog_name,blogName)){
                    updateRelations(likes[i].blog_name,blogName);
                    
                    if(!existeBlog(likes[i].blog_name)){
                        $scope.getBlogInfo(likes[i].blog_name);
                    }
                    
                    updateRelCount();
                    
                    $scope.myBlogs = getMyBlogs();
                }
            }
            
        }).error(function(response){
            console.log(response);
        });
    };
    
});

var getBlog=function(blogname){
    return BlogsRepository.filter(function(el){
        return el.name == blogname;
    });
};

var updateRelCount = function(){
    for(var i in BlogsRepository){
        var seguindo = RelationsRepository.filter(function(el){
            return el.seguidor == BlogsRepository[i].name;
        });
        
        var seguidores = RelationsRepository.filter(function(el){
            return el.seguido == BlogsRepository[i].name;
        });
        
        BlogsRepository[i].seguidores = seguidores.length;
        BlogsRepository[i].seguindo = seguindo.length;
    }
};

var existeBlog = function(blogname){
    var blogfound = BlogsRepository.filter(function(el){
        return el.name == blogname;
    });
    
    if(blogfound.length == 1){
        return true;
    }
    else{
        return false;
    }
};

var existeRelacao = function(seguido,seguidor){
    return RelationsRepository.some(function(el){
        return el.seguido == seguido && el.seguidor == seguidor; 
    });
};

var getMyBlogs = function(){
    return BlogsRepository;
};

var updateBlogs = function(blog){
    blog.avlikes = 0;
    blog.seguindo = 0;
    blog.seguidores = 0;
    BlogsRepository.push(blog);
};

var updateRelations = function(seguido,seguidor){
    var _relation = {
        seguido:seguido,
        seguidor:seguidor
    };
    
    RelationsRepository.push(_relation);
};

angular.module('BlogsSimilares').factory("tumblrAPI",function($http){
    
    var baseUrl = 'http://api.tumblr.com/v2/blog/';
    var apiKey = '?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY';
    var blogBase = ".tumblr.com";
    var callback = "&callback=JSON_CALLBACK";
    
    var _getLikes = function(blogName, offset){
        
        var offstring = "&offset=" + offset;
        
        var call = baseUrl + blogName + blogBase +"/likes"+ apiKey + offstring + callback;
        
        return $http.jsonp(call);
    };
    
    var _getInfo = function(blogName){
        var call = baseUrl + blogName + blogBase + "/info" + apiKey + callback;
        
        return $http.jsonp(call);
    };
    
    return {
        getLikes : _getLikes,
        getInfo : _getInfo
    };
    
});


var BlogsRepository = [
        {
            "title": "Untitled",
            "name": "drfisting",
            "posts": 7,
            "url": "http://drfisting.tumblr.com/",
            "updated": 1391664688,
            "description": "",
            "is_nsfw": false,
            "ask": false,
            "ask_page_title": "Ask me anything",
            "ask_anon": false,
            "share_likes": true,
            "likes": 115,
            "avlikes" : 0,
            "seguindo":0,
            "seguidores":0
        }
    
    ];

var RelationsRepository = [];