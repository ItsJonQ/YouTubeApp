jQuery.noConflict();
(function($) {
	$(function() {

	// Visible Function
		function visible(){
			(function(c){ c.fn.visible=function(e){ var a=c(this), b=c(window), f=b.scrollTop(); b=f+b.height(); var d=a.offset().top; a=d+a.height(); var g=e===true?a:d; return(e===true?d:a)<=b&&g>=f; }; })(jQuery);
		}
		visible();

	// Global Variable
		var ytapp = {};

		ytapp.theBody = $('#body-container');
		ytapp.theLogo = $('#logo');

		ytapp.menuIcon = $('#masthead').find('.icon');

		ytapp.fullscreenIcon = $('#fullscreen-icon');

		ytapp.searchHeader = $('#search-results-header');
		ytapp.searchIcon = $('#search-icon');
		ytapp.searchInput = $('#search-input');
		ytapp.searchList = $('#results-list');
		ytapp.searchLoadTrigger = $('#search-load-trigger');
		ytapp.searchQuery = $('#search-query');
		ytapp.searchResults = $('#search-results');
		
		ytapp.sidebarContainer = $('#sidebar-container');
		ytapp.sidebarInnerContainer = $('#sidebar-inner-container');
		ytapp.sidebarIcon = $('#sidebar-icon');
		ytapp.sidebarHeader = $('#sidebar-header');
		ytapp.relatedList = $('#related-list');
		ytapp.relatedLoadTrigger = $('#related-load-trigger');

		ytapp.viewContainer = $('#viewer-container');

		ytapp.nowPlaying = $('#now-playing');

	// Function
		ytapp.videoEmbed = function(id) {
			var embed = '<iframe width="1280" height="720" src="http://www.youtube.com/embed/'+id+'?autoplay=1&vq=hd720" frameborder="0" allowfullscreen></iframe>';
			ytapp.viewContainer.html(embed);
		}

		ytapp.videoPlayClick = function() {
			$('.vid-click-play').on('click', function(){
				var ele = $(this).closest('.list');

				if(ytapp.sidebarContainer.hasClass('sidebar-init')) {
					ytapp.sidebarContainer.removeClass('sidebar-init');
					ytapp.sidebarIcon.addClass('active');
					ytapp.theBody.removeClass('hide-sidebar');
				}

				if(!ele.hasClass('selected')) {
					var title = ele.find('.title').text(),
						id = ele.data('video-id'),
						user = ele.find('.user').data('username');
					ytapp.searchList.find('li.list').removeClass('selected');
					ele.addClass('selected');
					ytapp.videoEmbed(id);
					ytapp.nowPlaying.html('<strong>'+title+'</strong> <small>by ' +user+'</small><span class="video-id hidden">'+id+'</span>');
					ytapp.relatedList.empty();
					ytapp.searchFetch(id, 'related');				
				}
			});	
		}

		ytapp.searchUser = function(){
			ytapp.searchList.find('.user span').on('click', function() {
				var usern = $(this).closest('.user').data('username');
				ytapp.searchList.empty();
				ytapp.searchQuery.val('u:'+usern);
				ytapp.searchFetch(usern, 'user');
			});	
		};

		ytapp.searchFetchTrigger = function(){
			if(ytapp.searchLoadTrigger.visible(true) === true) {
				var i = ytapp.searchQuery.val();
				ytapp.searchFetch(i);
			}
		}

		ytapp.relatedFetchTrigger = function(){
			if(ytapp.relatedLoadTrigger.visible(true) === true) {
				var i = ytapp.nowPlaying.find('.video-id').text();
				ytapp.searchFetch(i, 'related');
			}
		}

		ytapp.searchFetch = function(query, type) {
			var apiFeeds, offset, searchVars, searchUrl, searchType, searchUser;

			apiFeeds = 'http://gdata.youtube.com/feeds/api/';

			if(type == 'related') {
				offset = parseInt(ytapp.relatedList.find('li').size(), 10) + 1;
			} else {
				offset = parseInt(ytapp.searchList.find('li').size(), 10) + 1;
			}
			if (offset == null) { offset = 1; }		

			searchVars = 'max-results=15&start-index='+offset+'&alt=json';
			
			if(ytapp.searchQuery.val().indexOf("u:") != -1 || type == 'user') {
				if(type != null) {
					searchUser = query;
				} else {
					var userSearch = ytapp.searchQuery.val().split(':');
					searchUser = userSearch[1];				
				}
				searchType = 'user';
				searchUrl = apiFeeds+'users/'+searchUser+'/uploads?'+searchVars+'&v=2';
			} else if(type == 'related') {
				searchType = 'related';
				searchUrl = 'http://gdata.youtube.com/feeds/videos/'+query+'/related?'+searchVars;
			} else {
				searchType = 'search';
				searchUrl = apiFeeds+'videos?q='+query+'&'+searchVars+'&v=2';
			}

			$.getJSON(searchUrl, function(data) {
				var embedLocation = ytapp.searchList;
				if(searchType == 'search') {
					ytapp.searchHeader.html('<h5 class="text-thin">Search results for "<strong>'+query+'</strong>"</h5>');
				} else if(searchType == 'related') {
					ytapp.sidebarHeader.html('<h5 class="text-thin">Related Videos</h5>');
					embedLocation = ytapp.relatedList;
				} else if(searchType == 'user') {
					var userSearch = $('#search-query').val().split(':');
					searchUser = userSearch[1];
					ytapp.searchHeader.html('<h5 class="text-thin">Latest Videos from <strong>'+searchUser+'</strong></h5>');
				} else {}

				var feed = data.feed,
					entries = feed.entry;
				$.each(entries, function(i,data) {
					var title = data.title.$t,
						id = data.id.$t.split(':')[3],
						user = data.author[0].name.$t,
						userid = data.author[0].uri.$t.split('/')[6],
						date = new Date(data.published.$t),
						description = data.media$group.media$description.$t,
						thumb = data.media$group.media$thumbnail[0].url;
					if(searchType == 'related') {
						id = data.id.$t.split('/')[5];
						userid = data.author[0].uri.$t.split('/')[5];
					}
					embedLocation.append('<li data-video-id="'+id+'" class="list"><div class="thumbnail vid-click-play"><img src="'+thumb+'" width="120" height="90"></div><div class="content"><div class="title vid-click-play"><strong>'+title+'</strong></div><div class="user" data-username="'+userid+'">by <span>'+user+'</span></div></div></li>');
				});		

				ytapp.videoPlayClick();
				ytapp.searchUser();

			}).error(function() {
				var returnVal = ytapp.searchQuery.val()
				ytapp.searchList.empty();
				ytapp.searchheader.html("<h5 class='text-thin'>Something went wrong <strong>:(</strong>. <br>We couldn't find anything for <strong>"+returnVal+"</strong>.</h5>");
			});
		}

		ytapp.fullscreenTrigger = function() {
			ytapp.theBody.toggleClass('fullscreen');
		}

	// Click Actions
		ytapp.menuIcon.on('click', function() {
			var $this = $(this);
			if(!$this.hasClass('active')) {
				$this.addClass('active');
			} else {
				$this.removeClass('active');
			}
		});

		ytapp.fullscreenIcon.on('click', function(){
			var $this = $(this),
				b = ytapp.theBody;
			if(!b.hasClass('fullscreen')) {
				$this.removeClass('icon-resize-enlarge').addClass('icon-resize-shrink');
				b.addClass('fullscreen');
			} else {
				$this.removeClass('icon-resize-shrink').addClass('icon-resize-enlarge');
				b.removeClass('fullscreen');
			}
		});

		ytapp.searchInput.submit(function(e){
			ytapp.searchResults.removeClass('subtle');
			e.preventDefault();
			var i = ytapp.searchQuery.val();
			ytapp.searchList.empty();
			ytapp.searchFetch(i);
		});

		ytapp.searchIcon.on('click', function() {
			if(ytapp.theBody.hasClass('fullscreen')) {
				ytapp.theBody.removeClass('fullscreen');
			} else {
				ytapp.theBody.toggleClass('hide-search');
			}
		});

		ytapp.searchResults.on('scroll', function() {
			ytapp.searchFetchTrigger();
		});	

		ytapp.sidebarIcon.on('click', function(){
			if(ytapp.theBody.hasClass('fullscreen')) {
				ytapp.theBody.removeClass('fullscreen');
			} else {
				ytapp.theBody.toggleClass('hide-sidebar');
			}
		});

		ytapp.sidebarInnerContainer.on('scroll', function() {
			ytapp.relatedFetchTrigger();
		});	

		ytapp.theLogo.on('click', function(){
			location.reload();
		});


	// Key Actions
		$(document).on('keydown', function(e) {
			if(e.keyCode == 70) {
				ytapp.fullscreenTrigger();
			}
		});

	});
})(jQuery);