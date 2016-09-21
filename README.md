# Content-Scraper-Nodejs
An npm Package for Node.js using a third party npm package to scrape content from the site. 

This project is a Node.js command line application that goes to an Ecommerce site to gets the latest prices and saves them to a spreadsheet (CSV format). This spreadsheet will be used by another application to populate a database.

This creates a csv file with current date of when the scrape happened e.g. 2016-01-29.csv. 

The csv file column headers Title, Price, ImageURL, URL and Time . 



## Basic Usage

```javascript
var Scraper = require("content_scraper");

var url = "http://google.com";

var shirts4mikeScraper = new Scraper(url);

/**
* If a parsing, network or HTTP error occurs an
* error object is passed in to the handler or callback
**/
shirts4mikeScraper.on("error", console.error);
```

### Example of Returned Data

```javascript
['title', 'price', 'image', 'href', 'time']
[ 
  {    title: 'Mike the Frog Shirt, Orange',
       price: '$20',
       imageUrl: 'http://www.shirts4mike.com/img/shirts/shirt-108.jpg',
       href: 'http://www.shirts4mike.com/shirt.php?id=108',
       time: '3:37:58 PM'
  },
  {    title: 'Mike the Frog Shirt, Orange',
       price: '$20',
       imageUrl: 'http://www.shirts4mike.com/img/shirts/shirt-108.jpg',
       href: 'http://www.shirts4mike.com/shirt.php?id=108',
       time: '3:37:58 PM'
  },
]
```

`title`, `price`, `url` and `imageURL` are `strings` and `time` is a JavaScript `Date` object.
