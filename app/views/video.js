import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'iframe',
  attributeBindings: ['src'],
  src: function() {
    var id = this.controller.content.id;
    return 'http://youtube.com/embed/' + id;
  }.property()
});
