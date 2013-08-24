jQuery.noConflict();
(function($) {
	$(function() {

	// Visible Function
		function visible(){
			(function(c){ c.fn.visible=function(e){ var a=c(this), b=c(window), f=b.scrollTop(); b=f+b.height(); var d=a.offset().top; a=d+a.height(); var g=e===true?a:d; return(e===true?d:a)<=b&&g>=f; }; })(jQuery);
		}
		visible();

	// Global Variable
		var ytm = {};

		ytm.theBody = $('#body-container');
		ytm.theLogo = $('#logo');

		ytm.menuIcon = $('#masthead').find('.icon');

		ytm.fullscreenIcon = $('#fullscreen-icon');

		ytm.searchHeader = $('#search-results-header');
		ytm.searchIcon = $('#search-icon');
		ytm.searchInput = $('#search-input');
		ytm.searchList = $('#results-list');
		ytm.searchLoadTrigger = $('#search-load-trigger');
		ytm.searchQuery = $('#search-query');
		ytm.searchResults = $('#search-results');
		
		ytm.sidebarContainer = $('#sidebar-container');
		ytm.sidebarInnerContainer = $('#sidebar-inner-container');
		ytm.sidebarIcon = $('#sidebar-icon');
		ytm.sidebarHeader = $('#sidebar-header');
		ytm.relatedList = $('#related-list');
		ytm.relatedLoadTrigger = $('#related-load-trigger');

		ytm.viewContainer = $('#viewer-container');

		ytm.nowPlaying = $('#now-playing');

		ytm.fullscreenClass = 'fullscreen';
		ytm.hideSidebarClass = 'hide-sidebar';
		ytm.sidebarInitClass = 'sidebar-init';
		ytm.hideSearchClass = 'hide-search';
		ytm.scrollSelectClass = 'scroll-selected';
		ytm.selectedItemClass = 'selected';
		ytm.vidClickClass = 'vid-click-play';

	// Functions
		ytm.videoPlayClick = function(obj) {
			var ele = obj.closest('.list');

			if(ytm.sidebarContainer.hasClass(ytm.sidebarInitClass)) {
				ytm.sidebarContainer.removeClass(ytm.sidebarInitClass);
				ytm.sidebarIcon.addClass('active');
				ytm.theBody.removeClass(ytm.hideSidebarClass);
			}

			if(!ele.hasClass('currently-playing')) {
				var title = ele.find('.title').text(),
					id = ele.data('video-id'),
					user = ele.find('.user').data('username');
				ytm.searchList.find('li').removeClass('currently-playing '+ytm.selectedItemClass);
				ele.addClass('currently-playing '+ytm.selectedItemClass);
				ytm.videoEmbed(id);
				ytm.nowPlaying.html('<strong>'+title+'</strong> <small>by ' +user+'</small><span class="video-id hidden">'+id+'</span>');
				ytm.sidebarInnerContainer.scrollTop(0);
				ytm.relatedList.height(ytm.relatedList.height()).empty();
				setTimeout(function(){
					ytm.searchFetch(id, 'related', 'first');	
				}, 50);
			}
		};

		ytm.videoEmbed = function(id) {
			var embed = '<iframe width="1280" height="720" src="http://www.youtube.com/embed/'+id+'?autoplay=1&vq=hd720" frameborder="0" allowfullscreen></iframe>';
			ytm.viewContainer.html(embed);
		};

		ytm.searchFail = function(){
			var returnVal = ytm.searchQuery.val();
			ytm.searchList.empty();
			ytm.searchheader.html("<h5 class='text-thin'>Something went wrong <strong>:(</strong>. <br>We couldn't find anything for <strong>"+returnVal+"</strong>.</h5>");
		};

		ytm.searchFetchTrigger = function(){
			if(ytm.searchLoadTrigger.visible(true) === true) {
				var i = ytm.searchQuery.val();
				ytm.searchFetch(i);
			}
		};

		ytm.relatedFetchTrigger = function(){
			if(ytm.relatedLoadTrigger.visible(true) === true) {
				var i = ytm.nowPlaying.find('.video-id').text();
				ytm.searchFetch(i, 'related');
			}	
		};

		ytm.searchUserTrigger = function(username) {
			ytm.searchList.empty();
			ytm.searchQuery.val('u:'+username);
			ytm.searchFetch(username, 'user');
		};

		ytm.searchUser = function(){
			$('.user span').on('click', function() {
				var username = $(this).closest('.user').data('username');
				ytm.searchUserTrigger(username);
			});	
		};

		ytm.scrollOffset = function(list, direction){
			var a = list.find('.'+ytm.selectedItemClass),
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
					total += $(this).outerHeight();
				});
				if(a.offset().top > br) {
					b.scrollTop(total - h);
				}
			} else if (direction === 'reset') {
				b.scrollTop(ps * a.outerHeight());
			} else {
				return false;
			}
		};

		ytm.searchFetch = function(query, type, fetchSeq) {
			var apiFeeds, offset, searchVars, maxResults, searchUrl, searchType, searchUser;

			apiFeeds = 'http://gdata.youtube.com/feeds/api/';
			maxResults = 15;

			if(type === 'related') {
				maxResults = 10;
				offset = parseInt(ytm.relatedList.find('li').size(), 10) + 1;
			} else {
				offset = parseInt(ytm.searchList.find('li').size(), 10) + 1;
			}
			if (offset === null || fetchSeq === 'first' ) { offset = 1; }		

			searchVars = 'max-results='+maxResults+'&start-index='+offset+'&alt=json';
			
			if(type === 'user') {
				var userSearch = ytm.searchQuery.val().split(':');
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
				var embedLocation = ytm.searchList;
				if(searchType === 'search') {
					ytm.searchHeader.html('<h5 class="text-thin">Search results for "<strong>'+query+'</strong>"</h5>');
				} else if(searchType === 'related') {
					ytm.sidebarHeader.html('<h5 class="text-thin">Related Videos</h5>');
					embedLocation = ytm.relatedList;
				} else if(searchType === 'user') {
					var userSearch = ytm.searchQuery.val().split(':');
					searchUser = userSearch[1];
					ytm.searchHeader.html('<h5 class="text-thin">Latest Videos from <strong>'+searchUser+'</strong></h5>');
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
						embedLocation.append('<li data-video-id="'+id+'" class="list"><div class="thumbnail '+ytm.vidClickClass+'"><img src="'+thumb+'" width="120" height="90"></div><div class="content"><div class="title '+ytm.vidClickClass+'"><strong>'+title+'</strong></div><div class="user" data-username="'+userid+'">by <span>'+user+'</span></div></div></li>');
					});
					ytm.relatedList.css('height', 'auto');
					if(!$('.'+ytm.scrollSelectClass).find('li').hasClass(ytm.selectedItemClass)){
						$('.'+ytm.scrollSelectClass).find('li').first().addClass(ytm.selectedItemClass);
					}
					$('.'+ytm.vidClickClass).on('click', function(){
						ytm.videoPlayClick($(this));
					});
					ytm.searchUser();	
				} else {
					ytm.searchFail();
				}
			}).fail(function() {
				ytm.searchFail();
			});
		};

		ytm.menuIconTrigger = function(obj) {
			var $this = obj;
			if(ytm.theBody.hasClass(ytm.fullscreenClass)) {
				if($this.hasClass('fullscreen-click')) {
					$this.removeClass('active');
				}
				return false;
			} else {
				$this.toggleClass('active');				
			}
		};

		ytm.fullscreenTrigger = function() {
			ytm.theBody.toggleClass(ytm.fullscreenClass);
			ytm.fullscreenIcon.toggleClass('icon-resize-shrink').toggleClass('icon-resize-enlarge');
		};

		ytm.searchBarTrigger = function(){
			if(ytm.theBody.hasClass(ytm.fullscreenClass)) {
				ytm.theBody.removeClass(ytm.fullscreenClass);
				ytm.fullscreenIcon.removeClass('active');
			} else {
				ytm.theBody.toggleClass('hide-search');
			}
		};

		ytm.sidebarTrigger = function() {
			if(ytm.theBody.hasClass(ytm.fullscreenClass)) {
				ytm.theBody.removeClass(ytm.fullscreenClass);
				ytm.fullscreenIcon.removeClass('active');
			} else {
				ytm.theBody.toggleClass(ytm.hideSidebarClass);
			}
		};

		ytm.sidebarSwitchSelected = function(ele, val) {
			if(!ytm.theBody.hasClass(val)) {
				$('.'+ytm.scrollSelectClass).removeClass(ytm.scrollSelectClass);
				$('.'+ytm.selectedItemClass).removeClass(ytm.selectedItemClass);
				ele.scrollTop(0).addClass(ytm.scrollSelectClass);
				ele.find('li').first().addClass(ytm.selectedItemClass);				
			}
		};

	// Click Actions
		$('.'+ytm.vidClickClass).on('click', function(){
			ytm.videoPlayClick($(this));
		});

		ytm.menuIcon.on('click', function() {
			ytm.menuIconTrigger($(this));
		});

		ytm.fullscreenIcon.on('click', function(){
			ytm.fullscreenTrigger();
		});

		ytm.searchInput.submit(function(e){
			ytm.searchResults.removeClass('subtle');
			e.preventDefault();
			var i = ytm.searchQuery.val();
			ytm.searchList.empty();
			if(i.indexOf("u:") !== -1) {
				ytm.searchFetch(i, 'user');
			} else {
				ytm.searchFetch(i);
			}
			ytm.searchQuery.blur();
			ytm.relatedList.focus();
		});

		ytm.searchIcon.on('click', function() {
			ytm.searchBarTrigger();
		});

		ytm.searchResults.on('mouseenter', function(){
			ytm.searchQuery.blur();
		});

		ytm.searchResults.on('scroll', function() {
			ytm.searchFetchTrigger();
		});	

		ytm.sidebarIcon.on('click', function(){
			ytm.sidebarTrigger();
		});

		ytm.sidebarInnerContainer.on('scroll', function() {
			ytm.relatedFetchTrigger();
		});	

		ytm.theLogo.on('click', function(){
			location.reload();
		});

	// Key Actions
		$(document).on('keydown', function(e) {
			// console.log(e.keyCode);

			// Activate Fullscreen
				// "F" Key || "End" Key
				if(e.keyCode === 70 || (e.keyCode === 35)) {
					ytm.fullscreenTrigger();
				}

			// Trigger Search Input
				// "S" Key + Shift || "Home" Key || "Tab" Key
				if((e.keyCode === 83 && e.shiftKey) || (e.keyCode === 36) || e.keyCode === 9) {
					e.preventDefault();
					ytm.searchQuery.focus();
				}

			// Trigger Left Sidebar
				// "Left" Key + Shift || "A" Key + Shift
				if((e.keyCode === 37 && e.shiftKey) || (e.keyCode === 65 && e.shiftKey)) {
					ytm.menuIconTrigger(ytm.searchIcon);
					ytm.searchBarTrigger();
				}

			// Trigger Right Sidebar
				// "Right" Key + Shift || "D" Key + Shift
				if((e.keyCode === 39 && e.shiftKey) || (e.keyCode === 68 && e.shiftKey)) {
					ytm.menuIconTrigger(ytm.sidebarIcon);
					ytm.sidebarTrigger();
				}

			// Trigger Switch "Selected" To Left Sidebar
				// "Left" Key || "A" Key
				if((e.keyCode === 37 && !e.shiftKey) || (e.keyCode === 65 && !e.shiftKey)) {
					ytm.sidebarSwitchSelected(ytm.searchResults, ytm.hideSearchClass);
				}

			// Trigger Switch "Selected" To Right Sidebar
				// "Right" Key || "D" Key
				if((e.keyCode === 39 && !e.shiftKey) || (e.keyCode === 68 && !e.shiftKey)) {
					ytm.sidebarSwitchSelected(ytm.sidebarInnerContainer, ytm.hideSidebarClass);
				}

			// Trigger Scroll Up in Selected List
				// "Up" Key || "W" Key
				if(e.keyCode === 38 || e.keyCode === 87) {
					e.preventDefault();
					var prev = $('.'+ytm.scrollSelectClass).find('.'+ytm.selectedItemClass).prev();
					if(!$('.'+ytm.scrollSelectClass).find('.'+ytm.selectedItemClass).is(':first-child')) {
						$('.'+ytm.scrollSelectClass).find('.'+ytm.selectedItemClass).removeClass(ytm.selectedItemClass);
						prev.addClass(ytm.selectedItemClass);
						ytm.scrollOffset($('.'+ytm.scrollSelectClass), 'up');
					} else {
						ytm.searchQuery.focus();
						ytm.relatedList.blur();
					}
				}

			// Trigger Scroll Up in Selected List
				// "Down" Key || "S" Key
				if(e.keyCode === 40 || e.keyCode === 83) {
					e.preventDefault();
					var next = $('.'+ytm.scrollSelectClass).find('.'+ytm.selectedItemClass).next();
					if(!$('.'+ytm.scrollSelectClass).find('.'+ytm.selectedItemClass).is(':last-child')) {
						$('.'+ytm.scrollSelectClass).find('.'+ytm.selectedItemClass).removeClass(ytm.selectedItemClass);
						next.addClass(ytm.selectedItemClass);
						ytm.scrollOffset($('.'+ytm.scrollSelectClass), 'down');
					}
				}

			// Trigger Play Selected Video
				// "Enter" Key || "E" Key || "Space" Key
				if(e.keyCode === 13 || e.keyCode === 69 || e.keyCode === 32) {
					if($('.'+ytm.selectedItemClass).length) {
						ytm.videoPlayClick($('.'+ytm.selectedItemClass));
					}
				}

			// Trigger User Search
				// "U" Key
				if(e.keyCode === 85) {
					var username = $('.'+ytm.selectedItemClass).find('.user').data('username');
					ytm.searchUserTrigger(username);
				}
		});

		$('input, textarea').keydown(function(e){
			// "Down" Key
			if(e.keyCode === 40) {
				e.preventDefault();
				ytm.searchQuery.blur();
				ytm.relatedList.focus();
			}

			// "Home" Key || "Tab" Key
			if(e.keyCode === 36 || e.keyCode === 9) {
				e.preventDefault()
				ytm.searchQuery.val('');
			}
			event.stopPropagation();
		});

		ytm.searchQuery.focus();

	});
})(jQuery);