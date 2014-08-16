import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return $.getJSON('http://gdata.youtube.com/feeds/api/videos/'+params.video_id+'?v=2&alt=jsonc')
      .then(function( data ) {
        return data.data;
      });
  }
});
