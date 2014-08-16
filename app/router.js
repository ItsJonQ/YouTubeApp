import Ember from 'ember';

var Router = Ember.Router.extend({
  location: 'auto'
});

Router.map(function() {
  this.resource('videos');
  this.resource('video', { path: '/watch/:video_id' });
});

export default Router;
