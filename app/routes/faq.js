import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Route.extend({
  model: function() {
    this.store.push('faq', {id: 1, question: 'Question 1', answer: 'Answer 1'});
    this.store.push('faq', {id: 2, question: 'Question 2', answer: 'Answer 2'});

    return this.store.all('faq');
  }
});
