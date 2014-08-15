import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    this.store.push('video', {id:1, title:'video'});
    return this.store.all('video');
  }
});
