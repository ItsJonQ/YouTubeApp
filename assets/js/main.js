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

		ytapp.fullscreenClass = 'fullscreen';
		ytapp.hideSidebarClass = 'hide-sidebar';
		ytapp.sidebarInitClass = 'sidebar-init';
		ytapp.hideSearchClass = 'hide-search';
		ytapp.scrollSelectClass = 'scroll-selected';
		ytapp.selectedItemClass = 'selected';
		ytapp.vidClickClass = 'vid-click-play';

	// Functions
		ytapp.videoPlayClick = function(obj) {
			var ele = obj.closest('.list');

			if(ytapp.sidebarContainer.hasClass(ytapp.sidebarInitClass)) {
				ytapp.sidebarContainer.removeClass(ytapp.sidebarInitClass);
				ytapp.sidebarIcon.addClass('active');
				ytapp.theBody.removeClass(ytapp.hideSidebarClass);
			}

			if(!ele.hasClass('currently-playing')) {
				var title = ele.find('.title').text(),
					id = ele.data('video-id'),
					user = ele.find('.user').data('username');
				ytapp.searchList.find('li').removeClass('currently-playing '+ytapp.selectedItemClass);
				ele.addClass('currently-playing '+ytapp.selectedItemClass);
				ytapp.videoEmbed(id);
				ytapp.nowPlaying.html('<strong>'+title+'</strong> <small>by ' +user+'</small><span class="video-id hidden">'+id+'</span>');
				ytapp.sidebarInnerContainer.scrollTop(0);
				ytapp.relatedList.height(ytapp.relatedList.height()).empty();
				setTimeout(function(){
					ytapp.searchFetch(id, 'related', 'first');	
				}, 50);
			}
		};

		ytapp.videoEmbed = function(id) {
			var embed = '<iframe width="1280" height="720" src="http://www.youtube.com/embed/'+id+'?autoplay=1&vq=hd720" frameborder="0" allowfullscreen></iframe>';
			ytapp.viewContainer.html(embed);
		};

		ytapp.searchFail = function(){
			var returnVal = ytapp.searchQuery.val();
			ytapp.searchList.empty();
			ytapp.searchheader.html("<h5 class='text-thin'>Something went wrong <strong>:(</strong>. <br>We couldn't find anything for <strong>"+returnVal+"</strong>.</h5>");
		};

		ytapp.searchFetchTrigger = function(){
			if(ytapp.searchLoadTrigger.visible(true) === true) {
				var i = ytapp.searchQuery.val();
				ytapp.searchFetch(i);
			}
		};

		ytapp.relatedFetchTrigger = function(){
			if(ytapp.relatedLoadTrigger.visible(true) === true) {
				var i = ytapp.nowPlaying.find('.video-id').text();
				ytapp.searchFetch(i, 'related');
			}	
		};

		ytapp.searchUserTrigger = function(username) {
			ytapp.searchList.empty();
			ytapp.searchQuery.val('u:'+username);
			ytapp.searchFetch(username, 'user');
		};

		ytapp.searchUser = function(){
			$('.user span').on('click', function() {
				var username = $(this).closest('.user').data('username');
				ytapp.searchUserTrigger(username);
			});	
		};

		ytapp.scrollOffset = function(list, direction){
			var a = list.find('.'+ytapp.selectedItemClass),
				b = list,
				br = list.height(),
				p = a.prevAll(),
				ps = p.size(),
				h = a.outerHeight(),
				total;
			if(direction === 'up') {
				if( a.offset().top < (h * 2) ) {
					b.scrollTop(ps * h - h);
				} else if (ps === 0) {
					b.scrollTop(0);
				}
			} else if (direction === 'down') {
				total = h;
				$.each(p, function(){
					total += $(this).height();
				});
				if(a.offset().top > br) {
					b.scrollTop(total);
				}
			} else if (direction === 'reset') {
				b.scrollTop(ps * a.outerHeight());
			} else {
				return false;
			}
		};

		ytapp.searchFetch = function(query, type, fetchSeq) {
			var apiFeeds, offset, searchVars, maxResults, searchUrl, searchType, searchUser;

			apiFeeds = 'http://gdata.youtube.com/feeds/api/';
			maxResults = 15;

			if(type === 'related') {
				maxResults = 10;
				offset = parseInt(ytapp.relatedList.find('li').size(), 10) + 1;
			} else {
				offset = parseInt(ytapp.searchList.find('li').size(), 10) + 1;
			}
			if (offset === null || fetchSeq === 'first' ) { offset = 1; }		

			searchVars = 'max-results='+maxResults+'&start-index='+offset+'&alt=json';
			
			if(type === 'user') {
				var userSearch = ytapp.searchQuery.val().split(':');
				searchUser = userSearch[1];				
				searchType = 'user';
				searchUrl = apiFeeds+'users/'+searchUser+'/uploads?'+searchVars+'&v=2';
			} else if(type === 'related') {
				searchType = 'related';
				searchUrl = 'http://gdata.youtube.com/feeds/videos/'+query+'/related?'+searchVars;
			} else {
				searchType = 'search';
				searchUrl = apiFeeds+'videos?q='+query+'&'+searchVars+'&v=2';
			}

			$.getJSON(searchUrl, function(data) {
				var embedLocation = ytapp.searchList;
				if(searchType === 'search') {
					ytapp.searchHeader.html('<h5 class="text-thin">Search results for "<strong>'+query+'</strong>"</h5>');
				} else if(searchType === 'related') {
					ytapp.sidebarHeader.html('<h5 class="text-thin">Related Videos</h5>');
					embedLocation = ytapp.relatedList;
				} else if(searchType === 'user') {
					var userSearch = ytapp.searchQuery.val().split(':');
					searchUser = userSearch[1];
					ytapp.searchHeader.html('<h5 class="text-thin">Latest Videos from <strong>'+searchUser+'</strong></h5>');
				} else {}

				var feed = data.feed,
					entries = feed.entry;

				if(entries) {
					$.each(entries, function(i,data) {
						var title = data.title.$t,
							id = data.id.$t.split(':')[3],
							user = data.author[0].name.$t,
							userid = data.author[0].uri.$t.split('/')[6],
							date = new Date(data.published.$t),
							description = data.media$group.media$description.$t,
							thumb = data.media$group.media$thumbnail[0].url;
						if(searchType === 'related') {
							id = data.id.$t.split('/')[5];
							userid = data.author[0].uri.$t.split('/')[5];
						}
						embedLocation.append('<li data-video-id="'+id+'" class="list"><div class="thumbnail '+ytapp.vidClickClass+'"><img src="'+thumb+'" width="120" height="90"></div><div class="content"><div class="title '+ytapp.vidClickClass+'"><strong>'+title+'</strong></div><div class="user" data-username="'+userid+'">by <span>'+user+'</span></div></div></li>');
					});
					ytapp.relatedList.css('height', 'auto');
					if(!$('.'+ytapp.scrollSelectClass).find('li').hasClass(ytapp.selectedItemClass)){
						$('.'+ytapp.scrollSelectClass).find('li').first().addClass(ytapp.selectedItemClass);
					}
					$('.'+ytapp.vidClickClass).on('click', function(){
						ytapp.videoPlayClick($(this));
					});
					ytapp.searchUser();	
				} else {
					ytapp.searchFail();
				}
			}).fail(function() {
				ytapp.searchFail();
			});
		};

		ytapp.menuIconTrigger = function(obj) {
			var $this = obj;
			if(ytapp.theBody.hasClass(ytapp.fullscreenClass)) {
				if($this.hasClass('fullscreen-click')) {
					$this.removeClass('active');
				}
				return false;
			} else {
				$this.toggleClass('active');				
			}
		};

		ytapp.fullscreenTrigger = function() {
			ytapp.theBody.toggleClass(ytapp.fullscreenClass);
			ytapp.fullscreenIcon.toggleClass('icon-resize-shrink').toggleClass('icon-resize-enlarge');
		};

		ytapp.searchBarTrigger = function(){
			if(ytapp.theBody.hasClass(ytapp.fullscreenClass)) {
				ytapp.theBody.removeClass(ytapp.fullscreenClass);
				ytapp.fullscreenIcon.removeClass('active');
			} else {
				ytapp.theBody.toggleClass('hide-search');
			}
		};

		ytapp.sidebarTrigger = function() {
			if(ytapp.theBody.hasClass(ytapp.fullscreenClass)) {
				ytapp.theBody.removeClass(ytapp.fullscreenClass);
				ytapp.fullscreenIcon.removeClass('active');
			} else {
				ytapp.theBody.toggleClass(ytapp.hideSidebarClass);
			}
		};

		ytapp.sidebarSwitchSelected = function(ele, val) {
			if(!ytapp.theBody.hasClass(val)) {
				$('.'+ytapp.scrollSelectClass).removeClass(ytapp.scrollSelectClass);
				$('.'+ytapp.selectedItemClass).removeClass(ytapp.selectedItemClass);
				ele.scrollTop(0).addClass(ytapp.scrollSelectClass);
				ele.find('li').first().addClass(ytapp.selectedItemClass);				
			}
		};

	// Click Actions
		$('.'+ytapp.vidClickClass).on('click', function(){
			ytapp.videoPlayClick($(this));
		});

		ytapp.menuIcon.on('click', function() {
			ytapp.menuIconTrigger($(this));
		});

		ytapp.fullscreenIcon.on('click', function(){
			ytapp.fullscreenTrigger();
		});

		ytapp.searchInput.submit(function(e){
			ytapp.searchResults.removeClass('subtle');
			e.preventDefault();
			var i = ytapp.searchQuery.val();
			ytapp.searchList.empty();
			if(i.indexOf("u:") !== -1) {
				ytapp.searchFetch(i, 'user');
			} else {
				ytapp.searchFetch(i);
			}
			ytapp.searchQuery.blur();
			ytapp.relatedList.focus();
		});

		ytapp.searchIcon.on('click', function() {
			ytapp.searchBarTrigger();
		});

		ytapp.searchResults.on('mouseenter', function(){
			ytapp.searchQuery.blur();
		});

		ytapp.searchResults.on('scroll', function() {
			ytapp.searchFetchTrigger();
		});	

		ytapp.sidebarIcon.on('click', function(){
			ytapp.sidebarTrigger();
		});

		ytapp.sidebarInnerContainer.on('scroll', function() {
			ytapp.relatedFetchTrigger();
		});	

		ytapp.theLogo.on('click', function(){
			location.reload();
		});

	// Key Actions
		$(document).on('keydown', function(e) {
			// console.log(e.keyCode);

			// Activate Fullscreen
				// "F" Key || "End" Key
				if(e.keyCode === 70 || (e.keyCode === 35)) {
					ytapp.fullscreenTrigger();
				}

			// Trigger Search Input
				// "S" Key + Shift || "Home" Key
				if((e.keyCode === 83 && e.shiftKey) || (e.keyCode === 36)) {
					e.preventDefault();
					ytapp.searchQuery.focus();
				}

			// Trigger Left Sidebar
				// "Left" Key + Shift || "A" Key + Shift
				if((e.keyCode === 37 && e.shiftKey) || (e.keyCode === 65 && e.shiftKey)) {
					ytapp.menuIconTrigger(ytapp.searchIcon);
					ytapp.searchBarTrigger();
				}

			// Trigger Right Sidebar
				// "Right" Key + Shift || "D" Key + Shift
				if((e.keyCode === 39 && e.shiftKey) || (e.keyCode === 68 && e.shiftKey)) {
					ytapp.menuIconTrigger(ytapp.sidebarIcon);
					ytapp.sidebarTrigger();
				}

			// Trigger Switch "Selected" To Left Sidebar
				// "Left" Key || "A" Key
				if((e.keyCode === 37 && !e.shiftKey) || (e.keyCode === 65 && !e.shiftKey)) {
					ytapp.sidebarSwitchSelected(ytapp.searchResults, ytapp.hideSearchClass);
				}

			// Trigger Switch "Selected" To Right Sidebar
				// "Right" Key || "D" Key
				if((e.keyCode === 39 && !e.shiftKey) || (e.keyCode === 68 && !e.shiftKey)) {
					ytapp.sidebarSwitchSelected(ytapp.sidebarInnerContainer, ytapp.hideSidebarClass);
				}

			// Trigger Scroll Up in Selected List
				// "Up" Key || "W" Key
				if(e.keyCode === 38 || e.keyCode === 87) {
					e.preventDefault();
					var prev = $('.'+ytapp.scrollSelectClass).find('.'+ytapp.selectedItemClass).prev();
					if(!$('.'+ytapp.scrollSelectClass).find('.'+ytapp.selectedItemClass).is(':first-child')) {
						$('.'+ytapp.scrollSelectClass).find('.'+ytapp.selectedItemClass).removeClass(ytapp.selectedItemClass);
						prev.addClass(ytapp.selectedItemClass);
						ytapp.scrollOffset($('.'+ytapp.scrollSelectClass), 'up');
					} else {
						ytapp.searchQuery.focus();
						ytapp.relatedList.blur();
					}
				}

			// Trigger Scroll Up in Selected List
				// "Down" Key || "S" Key
				if(e.keyCode === 40 || e.keyCode === 83) {
					e.preventDefault();
					var next = $('.'+ytapp.scrollSelectClass).find('.'+ytapp.selectedItemClass).next();
					if(!$('.'+ytapp.scrollSelectClass).find('.'+ytapp.selectedItemClass).is(':last-child')) {
						$('.'+ytapp.scrollSelectClass).find('.'+ytapp.selectedItemClass).removeClass(ytapp.selectedItemClass);
						next.addClass(ytapp.selectedItemClass);
						ytapp.scrollOffset($('.'+ytapp.scrollSelectClass), 'down');
					}
				}

			// Trigger Play Selected Video
				// "Enter" Key || "E" Key
				if(e.keyCode === 13 || e.keyCode === 69) {
					ytapp.videoPlayClick($('.'+ytapp.selectedItemClass));
				}

			// Trigger User Search
				// "U" Key
				if(e.keyCode === 85) {
					var username = $('.'+ytapp.selectedItemClass).find('.user').data('username');
					ytapp.searchUserTrigger(username);
				}
		});

		$('input, textarea').keydown(function(e){
			if(e.keyCode === 40 || e.keyCode === 9) {
				e.preventDefault();
				ytapp.searchQuery.blur();
				ytapp.relatedList.focus();
			}

			if(e.keyCode === 36) {
				ytapp.searchQuery.val('');
			}
			event.stopPropagation();
		});

		ytapp.searchQuery.focus();

	});
})(jQuery);