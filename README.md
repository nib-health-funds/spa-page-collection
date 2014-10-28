# spa-page-collection

A collection of pages for Single Page Applications. Simplifies navigating and displaying of SPA pages.

## Methods

### new Collection(options)

Create a new collection.

#### Options:

- `baseUrl` - The common URL path for all pages.
- `ignoreQueryString` - Whether the query string should be ignored for routing.
- `onPageNotFound` - A function to handle URLs that don't map to a page, instead of throwing an error.
- `hijackClicksOnAnchorTags` - Set whether the router should hijack clicks on <a/> tags and try navigating to a page 
within the SPA. Careful, setting this option to true will hijack all links - not just links to pages within your Single Page App. Defaults to false.

### .current()

Get the currently selected page.

### .prepend(page)

Add a page at the start of the collection.

### .append(page)

Add a page at the end of the collection.

### .listen()

Start the router listening for page changes.

### .navigate(page)

Navigate to a page. Updates the browser URL, title, history and displays the page.

## Page

Pages may emit the following events:

- navigate &lt;name&gt; - navigate to a specific page in the collection
- navigate 'previous' - navigate to the previous page in the collection
- navigate 'next' - navigate to the next page in the collection

Pages must implement the following methods:

### .getName()

Return the name of the page. Used for retrieving pages from the collection. The names `previous` and `next` have special meanings and should not be used.

### .getUrl()

Return the URL of the page. Used for routing.

### .getTitle()

Return the title of the page. Used for display in the browser window.

### .show()

Show the page.

### .hide()

Hide the page.

### .on()

Attach an event listener to the page.