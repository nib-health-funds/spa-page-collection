var router    = require('page');
var emitter   = require('emitter-on-steroids');
var forward   = require('forward-events');
var PageEvent = require('./event');

/**
 * A collection of pages
 * @constructor
 * @param   {Object}            options
 * @param   {String}            options.baseUrl
 * @param   {Function(Object)}  options.onPageNotFound
 */
function PageCollection(options) {

  if (!(this instanceof PageCollection)) {
    return new PageCollection(options);
  }

  /**
   * The current page
   * @private
   * @type  {Page|null}
   */
  this.page = null;

  /**
   * The pages
   * @private
   * @type  {Array}
   */
  this.pages = [];

  /**
   * The router (page.js)
   * @type  {page.js}
   */
  this.router = router;

  this.routerOptions = {};

  //set the router base path
  if (options && options.baseUrl) {
    this.router.base(options.baseUrl);
  }

  //set whether the router should hijack clicks on <a/> tags and try navigating to a page with a URL matching the href
  if (options && typeof(options.hijackClicksOnAnchorTags) === 'boolean') {
    this.routerOptions.click = options.hijackClicksOnAnchorTags;
  } else {
    this.routerOptions.click = false;
  }

  //set the page not found handler
  if (options && typeof(options.onPageNotFound) === 'function') {
    this.onPageNotFound = options.onPageNotFound;
  } else {
    this.onPageNotFound = function(context) {
      throw new Error('Unable to route URL "'+context.path+'" to a page.');
    };
  }

  //set whether the query string is ignored during routing
  this.ignoreQueryString = options && typeof options.ignoreQueryString !== 'undefined' ? options.ignoreQueryString : true;

}
emitter(PageCollection.prototype);

/**
 * Start listening to route changes
 * @returns   {PageCollection}
 */
PageCollection.prototype.listen = function() {

  //handle routes that don't map to a page
  this.router('*', this.onPageNotFound);

  //start routing
  this.router.start(this.routerOptions);

  return this;
};

/**
 * Find the index of a page
 * @param     {Page}  page
 * @returns   {Number}
 */
PageCollection.prototype.indexOf = function(page) {
  return this.pages.indexOf(page);
};

/**
 * Find a page by name
 * @param     {String}  name
 * @returns   {Page|null}
 */
PageCollection.prototype.findByName = function(name) {
  for (var i=0; i<this.pages.length; ++i) {
    if (this.pages[i].getName() === name) {
      return this.pages[i];
    }
  }
  return null;
};

/**
 * Find a page by URL
 * @param     {String}  url
 * @returns   {Page|null}
 */
PageCollection.prototype.findByUrl = function(url) {
  for (var i=0; i<this.pages.length; ++i) {
    if (this.pages[i].getUrl() === url) {
      return this.pages[i];
    }
  }
  return null;
};

/**
 * Get the current page
 * @param     {Page|String} page
 * @returns   {PageCollection}
 */
PageCollection.prototype.current = function() {
  return this.page;
};

/**
 * Navigate to the page
 * @param     {Page|String} page
 * @returns   {PageCollection}
 */
PageCollection.prototype.navigate = function(page) {
  var self = this;

  //fetch the page by name
  if (typeof page === 'string') {
    page = this.findByName(page);
  }

  //check a page is defined
  if (!page) {
    throw new Error('Page "'+page+'" not found.');
  }

  //don't bother navigating to the page if we're already there
  if (this.page === page) {
    return this;
  }

  //let libraries handle stuff
  this.emit(new PageEvent('navigate', this, page), function(err, event) {

    //navigate to the page if navigation hasn't been prevented
    if (!event.isDefaultPrevented()) {
      self.router.show(event.getPage().getUrl());
    }

  });

  return this;
};

/**
 * Navigate to the previous page in the collection
 * @returns   {PageCollection}
 */
PageCollection.prototype.navigatePrevious = function() {
  if (this.page) {

    //get the previous index
    var previous = this.pages.indexOf(this.page)-1;

    //check the previous index is in bounds
    if (previous >= 0) {
      this.navigate(this.pages[previous]);
    }

  }
  return this;
};

/**
 * Navigate to the next page in the collection
 * @returns   {PageCollection}
 */
PageCollection.prototype.navigateNext = function() {
  if (this.page) {

    //get the next index
    var next = this.pages.indexOf(this.page)+1;

    //check the next index is in bounds
    if (next < this.pages.length) {
      this.navigate(this.pages[next]);
    }

  }
  return this;
};

/**
 * Get the number of pages in the collection
 * @returns   {Number}
 */
PageCollection.prototype.count = function() {
  return this.pages.length;
};

/**
 * Get a page at the index
 * @param     {Number}  index
 * @returns   {PageCollection}
 */
PageCollection.prototype.at = function(index) {
  return this.pages[index];
};

/**
 * Add a page at the front of the collection
 * @param     {Page}  page
 * @returns   {PageCollection}
 */
PageCollection.prototype.prepend = function(page) {
  this.pages.unshift(page);
  this.bind(page);
  return this;
};

/**
 * Add a page at the end of the collection
 * @param     {Page}  page
 * @returns   {PageCollection}
 */
PageCollection.prototype.append = function(page) {
  this.pages.push(page);
  this.bind(page);
  return this;
};

/**
 * Bind events to a page
 * @private
 * @param     {Page}  page
 * @returns   {PageCollection}
 */
PageCollection.prototype.bind = function(page) {

  //forward events - adjust the event name and prepend the emitter to the arguments
  forward(page, this, function(type, arguments, src) {
    arguments.unshift(src);
    return {
      type:       'page:'+type,
      arguments:  arguments
    }
  });

  //handle routes matching the page URL
  this.router(page.getUrl(), this.onRouteMatched.bind(this));

  //handle page navigation
  page.on('navigate', this.onNavigate.bind(this));

  return this;
};

/**
 * Display a page
 * @private
 * @param     {Page}  page
 * @returns   {PageCollection}
 */
PageCollection.prototype.display = function(page) {

  //hide all the other pages
  for (var i=0; i<this.pages.length; ++i) {
    if (this.pages[i] !== page) {
      this.pages[i].hide();
    }
  }

  //show the page
  page.show();

  //update the page title
  var title = page.getTitle();
  if (typeof title !== 'undefined') {
    document.title = page.getTitle();
  }

  //set the current page
  this.page = page;

  this.emit(new PageEvent('display', this, page));
  return this;
};


/**
 * Called when the router has routed to a page
 * @private
 * @param     {Object}  context
 */
PageCollection.prototype.onRouteMatched = function(context) {
  var url = context.path;

  //strip the querystring from the URL
  if (this.ignoreQueryString) {
    var pos = url.indexOf('?');
    if (pos !== -1) {
      url = url.substr(0, pos);
    }
  }

  //find and show the page
  var page = this.findByUrl(url);
  if (page) {
    if (page !== this.page) {
      this.display(page);
    }
  } else{
    throw new Error('Unable to route URL "'+context.path+'" to a page.');
  }

};

/**
 * Called when a page has triggered navigation
 * @param   {String}  name  The page name
 */
PageCollection.prototype.onNavigate = function(name) {
  if (name === 'previous') {
    this.navigatePrevious();
  } else if (name === 'next') {
    this.navigateNext();
  } else {
    this.navigate(name);
  }
};

module.exports = PageCollection;
