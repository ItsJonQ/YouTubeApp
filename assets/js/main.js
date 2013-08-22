jQuery.noConflict();
(function($) {
	$(function() {
		function visible(){
			(function(c){ c.fn.visible=function(e){ var a=c(this), b=c(window), f=b.scrollTop(); b=f+b.height(); var d=a.offset().top; a=d+a.height(); var g=e===true?a:d; return(e===true?d:a)<=b&&g>=f; }; })(jQuery);
		}


		var videoEmbed = function(id) {
			var embed = '<iframe width="1280" height="720" src="http://www.youtube.com/embed/'+id+'?autoplay=1&vq=hd720" frameborder="0" allowfullscreen></iframe>';
			$('#viewer-container').html(embed);
		}

		var videoPlayClick = function() {
			$('#results-list li').find('.vid-click-play').on('click', function(){
				var ele = $(this).closest('.list');
				if(!ele.hasClass('selected')) {
					var title = ele.find('.title').text();
					var id = ele.data('video-id');
					var user = ele.find('.user').data('username');
					$('#results-list').find('li.list').removeClass('selected');
					ele.addClass('selected');
					videoEmbed(id);
					$('#now-playing').html('<strong>'+title+'</strong> <small>by ' +user+'</small>');					
				}
			});	
		}

		var searchFetchTrigger = function(){
			if($('#search-load-trigger').visible(true) === true) {
				var i = $('#search-query').val();
				var offset = parseInt($('#results-list').find('li').size(), 10);
				searchFetch(i, offset+1);
			}
		}

		var searchFetch = function(query, offset, type) {
			if (offset == null) { offset = 1; }
			var searchUrl, searchType, searchUser;
			if($('#search-query').val().indexOf("u:") != -1 || type == 'user') {
				if(type != null) {
					searchUser = query;
				} else {
					var userSearch = $('#search-query').val().split(':');
					searchUser = userSearch[1];				
				}
				searchType = 'user';
				searchUrl = 'http://gdata.youtube.com/feeds/api/users/'+searchUser+'/uploads?v=2&alt=json';
			} else {
				searchType = 'search';
				searchUrl = 'http://gdata.youtube.com/feeds/api/videos?q='+query+'&max-results=15&start-index='+offset+'&alt=json&v=2';
			}

			var searchUser = function(){
				$('#results-list li').find('.user').on('click', function() {
					$('#results-list').empty();
					var usern = $(this).data('username');
					$('#search-query').val('u:'+usern);
					searchFetch(usern, '', 'user');
				});	
			};

			$.getJSON(searchUrl, function(data) {
				if(searchType == 'search') {
					$('#search-results-header').html('<h5 class="text-thin">Search results for "<strong>'+query+'</strong>"</h5>');
				} else if(searchType == 'user') {
					var userSearch = $('#search-query').val().split(':');
					searchUser = userSearch[1];
					$('#search-results-header').html('<h5 class="text-thin">Latest Videos from <strong>'+searchUser+'</strong></h5>');
				} else {}
				var feed = data.feed;
				var entries = feed.entry;
				$.each(entries, function(i,data) {
					var title = data.title.$t;
					var id = data.id.$t.split(':')[3];
					var user = data.author[0].name.$t;
					var userid = data.author[0].uri.$t.split('/')[6];
					var views = data.yt$statistics.viewCount;
					var date = new Date(data.published.$t);
					var description = data.media$group.media$description.$t;
					var thumb = data.media$group.media$thumbnail[0].url;
					$('#results-list').append('<li data-video-id="'+id+'" class="list"><div class="thumbnail vid-click-play"><img src="'+thumb+'" width="120" height="90"></div><div class="content"><div class="title vid-click-play"><strong>'+title+'</strong></div><div class="user" data-username="'+userid+'">by <span>'+user+'</span></div><div class="views">'+views+' views</div></div></li>');
				});		
				videoPlayClick();
				searchUser();
			}).error(function() {
				var returnVal = $('#search-query').val()
				$('#results-list').html('');
				$('#search-results-header').html("<h5 class='text-thin'>Something went wrong <strong>:(</strong>. <br>We couldn't find anything for <strong>"+returnVal+"</strong>.</h5>");
			});
			// searchFetchTrigger();
		}

		// $('#search-results').on('mouseenter', function(){
		// 	$(this).removeClass('subtle');
		// });

		// $('#search').on('click', function(){
		// 	$('#search-results').addClass('subtle');
		// });

		$('#logo').on('click', function(){
			location.reload();
		});

		$('#search-input').submit(function(e){
			$('#search-results').removeClass('subtle');
			e.preventDefault();
			var i = $('#search-query').val();
			$('#results-list').html('');
			searchFetch(i);
		});

		$('#search-icon').on('click', function() {
			$('#body-container').toggleClass('hide-search');
		});

		$('#search-results').on('scroll', function() {
			searchFetchTrigger();
		});	

		visible();

	});
})(jQuery);