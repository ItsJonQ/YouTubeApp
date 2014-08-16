import Ember from 'ember';

var Router = Ember.Router.extend({
  location: 'auto'
});

Router.map(function() {
  this.route('video', { path: '/watch'});
  this.route('videos');
});

export default Router;
