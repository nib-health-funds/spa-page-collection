var Event = require('emitter-on-steroids/events.js').Event;

/**
 * A page event
 * @param   {String}  name      The event name
 * @param   {String}  emitter   The event emitter
 * @param   {Page}    page      The page object
 * @constructor
 */
function PageEvent(name, emitter, page) {
  this.page             = page;
  this.defaultPrevented = false;
  Event.apply(this, arguments);
};
PageEvent.prototype = new Event();

/**
 * Get the page object
 * @returns   {Page}
 */
PageEvent.prototype.getPage = function() {
  return this.page;
};

/**
 * Get whether the default action has been prevented
 * @returns   {PageEvent}
 */
PageEvent.prototype.isDefaultPrevented = function() {
  return this.defaultPrevented;
};

/**
 * Set whether the default action has been prevented
 * @returns   {PageEvent}
 */
PageEvent.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  return this;
};

module.exports = PageEvent;