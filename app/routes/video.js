import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var video_id='VA770wpLX-Q';

    return $.getJSON('http://gdata.youtube.com/feeds/api/videos/'+video_id+'?v=2&alt=jsonc')
      .then(function( data ) {
        return data.data;
      });
  }
});
