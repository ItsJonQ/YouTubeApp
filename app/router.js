import Ember from 'ember';

var Router = Ember.Router.extend({
  location: 'auto'
});

Router.map(function() {
  this.resource('videos', function() {
    this.resource('video', { path: ':video_id' });
  });
});

export default Router;
