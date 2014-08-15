import Ember from 'ember';

var Router = Ember.Router.extend({
  location: 'auto'
});

Router.map(function() {
  this.route('faq');
  this.route('video');
});

export default Router;
