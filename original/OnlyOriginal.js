var offset=0;
var totalposts=0;

function openModal(){
	var src = $(this).attr('src');			
        var img = '<img src="' + src + '" class="img-responsive"/>';
        $('#myModal').modal();
        $('#myModal').on('shown.bs.modal', function(){
			$('#myModal .modal-body').html(img);
		});
        $('#myModal').on('hidden.bs.modal', function(){
			$('#myModal .modal-body').html('');
		});
};

var blog="david";	

//var blog = "derekg.org";

function loadHeader(){
	$.ajax({
		url: "http://api.tumblr.com/v2/blog/" +blog+".tumblr.com/info?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY",
		dataType: 'jsonp',
		success: function(results){
			$(".titulo").html(results.response.blog.title); 
		}	
	});	
	$.ajax({
		url: "http://api.tumblr.com/v2/blog/" +blog+".tumblr.com/avatar/512?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY",
		dataType: 'jsonp',
		success: function(avatar){
			console.log(avatar);
			$(".avatar").attr('src',avatar.response.avatar_url);
		}
	});
}

function loadPosts(){
      if(offset <= totalposts){
        
        $.ajax({
            url: "http://api.tumblr.com/v2/blog/" +blog+".tumblr.com/posts/photo?api_key=sNCvOfqUTzUJzBOViCbYfkaGeQaFAS4Q4XNtHMu8YPo6No3OiY&reblog_info=true&offset="+offset,
            dataType: 'jsonp',
            success: function(posts){
                
                totalposts = posts.response.total_posts;
                
                var postings = posts.response.posts;
                console.log(posts.response);
                var textOriginals = '';
                var textReblogs = '';
                for (var i in postings) {
                    var p = postings[i];
                    if(!p.reblogged_root_name || p.reblogged_root_name == blog){
                        for (var m in p.photos){
                            textOriginals += '<li class="col-lg-3 col-md-3 col-sm-3 col-xs-4"><img src=' + p.photos[m].original_size.url +' class="img-responsive"><a href='+p.post_url+'>'+p.reblogged_root_name+'</a></li>';
                        }
                    }				
                }
                
                $('.original').append(textOriginals);
                $('.original li img').bind('click',openModal);
                
            }
            
        });
        
        offset = offset + 20;
        setTimeout(checkBottom, 1000);
        
    }
    else{
        $('div#loadmoreajaxloader').html('<center>No more posts to show.</center>');
    }
    
}

function checkBottom(){
    
    if($(window).scrollTop() == $(document).height() - $(window).height())
    {
        loadPosts();
    }
}

$(window).scroll(function(){
    checkBottom();
});



$(document).ready(function(){
	
	loadHeader();	
	
	loadPosts();
	
	$('li img').on('click',openModal);
	
	$("#loadmoreajaxloader").on('click',loadPosts)
});
