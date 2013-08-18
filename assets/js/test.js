jQuery.noConflict();
(function($) {
	$(function() {
		$('#search-input').submit(function(e){
			e.preventDefault();
			var i = $('#search-query').val();
			searchQuery(i);
		});

		var searchQuery = function(query) {
			var searchUrl = 'http://gdata.youtube.com/feeds/api/videos?q='+query+'&max-results=3&alt=json&v=2';
			$('#results-list').html('');
			$.getJSON(searchUrl, function(data) {
				var feed = data.feed;
				var entries = feed.entry;
				$.each(entries, function(i,data) {
					var title = data.title.$t;
					var id = data.id.$t.split(':')[3];
					var user = data.author[0].name.$t;
					var views = data.yt$statistics.viewCount;
					var date = new Date(data.published.$t);
					var description = data.media$group.media$description.$t;
					var thumb = data.media$group.media$thumbnail[0].url;
					$('#results-list').append('<li data-video-id="'+id+'"><div class="left"><img src="'+thumb+'" width="120" height="90"></div><div><strong>'+title+'</strong></div><div>by '+user+' - '+date+' - <small>'+views+' views</small></div><div class="clearfix">'+description+'</div><hr></li>');
				});
			});
		}

	});
})(jQuery);