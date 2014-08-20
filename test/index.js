var assert      = require('assert');
var Collection  = require('spa-page-collection');

function createPage(name, url, title) {
  var emitter = require('emitter');
  return emitter({

    getName: function() {
      return url;
    },

    getUrl: function() {
      return url;
    },

    getTitle: function() {
      return title;
    },

    show: function() {
      this.visible = true;
      return this;
    },

    hide: function() {
      this.visible = false;
      return this;
    }

  });
}

var collection;
describe('spa-page-collection', function() {

  beforeEach(function() {
    collection = new Collection({});
  });

  describe('.prepend()', function() {

    it('should update the number of pages', function() {
      assert.equal(0, collection.count());
      collection.prepend(createPage('page-3', 'page-3'));
      assert.equal(1, collection.count());
      collection.prepend(createPage('page-2', 'page-2'));
      assert.equal(2, collection.count());
      collection.prepend(createPage('page-1', 'page-1'));
      assert.equal(3, collection.count());
    });

    it('should be in the correct order', function() {

      collection.prepend(createPage('page-3', 'page-3'));
      collection.prepend(createPage('page-2', 'page-2'));
      collection.prepend(createPage('page-1', 'page-1'));

      assert.equal('page-1', collection.at(0).getName());
      assert.equal('page-2', collection.at(1).getName());
      assert.equal('page-3', collection.at(2).getName());

    });

    it('should forward events', function(done) {

      var page = createPage('page-3', 'page-3');

      collection.prepend(page);
      collection.on('page:click', function() {
        done();
      });

      page.emit('click');

    });

    it('should listen for navigate events and change the current page', function(done) {

      var page2 = createPage('page-2', 'page-2');
      collection.prepend(page2);

      var page1 = createPage('page-1', 'page-1');
      collection.prepend(page1);

      collection.on('navigate', function(page) {
        assert.equal(page2, page);
        done();
      });

      page1.emit('navigate', 'page-2');
    });

    it('should display the page when the route is matched', function() {

      var page2 = createPage('page-2', 'page-2');
      collection.prepend(page2);

      var page1 = createPage('page-1', 'page-1');
      collection.prepend(page1);

      collection.on('display', function(page) {
        assert.equal(page2, page);
        done();
      });

      collection.router(page2.getUrl());
    });

  });

  describe('.append()', function() {

  });

});