import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return $.getJSON('http://gdata.youtube.com/feeds/api/videos?q=ember.js&max-results=15&start-index=1&alt=json&v=2')

    .then(function(data) {
      return data.feed.entry.map(function(video) {
        video.id = video.media$group.yt$videoid.$t;
        video.title = video.title.$t;

        return video;
      });
    });
  }
});
