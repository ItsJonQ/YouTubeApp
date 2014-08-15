import DS from 'ember-data';

var Video = DS.Model.extend({
  title: DS.attr('string'),
  yid: DS.attr('string')
});

export default Video;
