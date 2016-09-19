var Scraper = require("content_scraper");

var shirts4mikeScraper = new Scraper();

/**
* When the "end" event is triggered an array of article 
* metadata is returned
**/
shirts4mikeScraper.on("end", console.dir);

/**
* If a parsing, network or HTTP error occurs an
* error object is passed in to the handler or callback
**/
shirts4mikeScraper.on("error", console.error);