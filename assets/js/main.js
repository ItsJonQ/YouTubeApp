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
			$('#results-list').find('li.list').on('click', function(){
				var id = $(this).data('video-id');
				$('#results-list').find('li.list').removeClass('selected');
				$(this).addClass('selected');
				videoEmbed(id);
			});
		}

		var searchFetch = function(query, offset) {
			if (offset == null) { offset = 1; }
			var searchUrl = 'http://gdata.youtube.com/feeds/api/videos?q='+query+'&max-results=10&start-index='+offset+'&alt=json&v=2';
			$.getJSON(searchUrl, function(data) {
				var feed = data.feed;
				var entries = feed.entry;
				$.each(entries, function(i,data) {
					var title = data.title.$t;
					var id = data.id.$t.split(':')[3];
					var user = data.author[0].name.$t;
					// var views = data.yt$statistics.viewCount;
					var date = new Date(data.published.$t);
					var description = data.media$group.media$description.$t;
					var thumb = data.media$group.media$thumbnail[0].url;
					$('#results-list').append('<li data-video-id="'+id+'" class="list"><div class="thumbnail"><img src="'+thumb+'" width="120" height="90"></div><div class="content"><div class="title"><strong>'+title+'</strong></div><div class="user">by '+user+'</div></div></li>');
				});
				$('#search-results-header').html('<h5 class="text-thin">Search results for "<strong>'+query+'</strong>"</h5>')
				videoPlayClick();
			});			
		}

		$('#search-results').on('mouseenter', function(){
			$(this).removeClass('subtle');
		});

		$('#search').on('click', function(){
			$('#search-results').addClass('subtle');
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
			if($('#search-load-trigger').visible(true) === true) {
				console.log('fetched');
				var i = $('#search-query').val();
				var offset = parseInt($('#results-list').find('li').size(), 10);
				searchFetch(i, offset+1);
			}
		});	

		visible();

	});
})(jQuery);