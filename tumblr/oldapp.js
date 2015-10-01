(function(){
    var app = angular.module('similar',[]);
    
    
    app.controller('BlogController', ['$http',function($http){
        
        var BC = this;
        
        this.blogs =[];
        this.blogfound={};
        
        this.blogfound.isFound = false;
        this.blogfound.msg = "Digite um blog para pesquisar";
        
        this.searchterm = "";
        
        
        this.searchblog = function(blogtofind){
            if(blogtofind === ""){
                this.blogfound.isFound = false;
                this.blogfound.msg = "Digite um blog para pesquisar";
            }
            else{
                $http.jsonp(buscaInfo(blogtofind))
                .success(function(data){
                    BC.blogfound.isFound = true;
                    BC.blogfound.blog = parseBlogInfo(data.response);  
                    BC.blogfound.blog.avatar = buscaAvatar(BC.blogfound.blog.url,128);
                    
                })
                .error(function(data){
                    BC.blogfound.isFound = false;
                    BC.blogfound.msg = "Blog pesquisado não encontrado!";
                });
            }
        };
        
        
        this.addblog = function(blog){
            this.blogs.push(blog);
        };
    }]);
    
    var fmtNmBlog = function(nomeblog){
        return nomeblog+".tumblr.com";
    };
    
    var buscaInfo = function(nomeblog){
        var auxbusca = "http://api.tumblr.com/v2/blog/"+fmtNmBlog(nomeblog)+"/info?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY&callback=JSON_CALLBACK";
        return auxbusca;
    };
    
    var buscaAvatar=function(blogURL,avatarSize){
        
        var urladj = blogURL.replace("http://","");
        
        var auxbusca = "http://api.tumblr.com/v2/blog/"+urladj+"avatar/"+avatarSize+"?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY";
        
        return auxbusca;
    };
    
    var parseBlogInfo = function(blogdata){
      var blogInfo = {};
      
      blogInfo.title = blogdata.blog.title;
      blogInfo.url = blogdata.blog.url;
      
      return blogInfo;
    };
})();