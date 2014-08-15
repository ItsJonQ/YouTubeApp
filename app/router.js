import Ember from 'ember';

var Router = Ember.Router.extend({
  location: YtmENV.locationType
});

Router.map(function() {
  this.resource('todos', { path: '/' }, function() {
  });
});

export default Router;
