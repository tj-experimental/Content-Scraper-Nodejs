//<editor-fold desc="Description">
/*The scraper should generate a folder called data if it doesn’t exist.

The information from the site should be stored in a CSV file with today’s day e.g. 2016-01-29.csv.

Use a third party npm package to scrape content from the site. 

You should be able to explain why you chose that package.

The scraper should be able to visit the website http://shirts4mike.com and follow links to all t-shirts.

The scraper should get the price, title, url and image url from the product page and save it in the CSV.

Use a third party npm package to create an CSV file. 
You should be able to explain why you chose that package.

The column headers should be in in this order Title, Price, ImageURL, URL and Time. 

Time should be the current date time of when the scrape happened. 

If they aren’t in this order the can’t be entered into the database of the price comparison site.

If the site is down, an error message describing the issue should appear in the console. 

This is to be tested by disabling wifi on your device.

If the data file for today already exists it should overwrite the file.

Code should be well documented.*/
//</editor-fold>


const http = require('http');
const fs = require('fs');
const EventEmitter = require("events").EventEmitter;
const util = require("util");
const xRay = require("x-ray");
var x = xRay();


//Use x-ray module or osmosis for content scraping

//json2csv to convert the json object to a csv file


/*
@param {string} url - The url of the site to scrape
@param {requestCallback} response - the callback that handles the response
@param {string} body - the body of the response
*/
function Scraper(url){

    EventEmitter.call(this);

    var scraperEmitter = this;

    if(typeof url !== 'string'){
        scraperEmitter.emit('error', new Error("The url type is not a string"));
    }

    if(url !== "" && typeof url === 'string') {
        var request = http.get(url, function (response) {
            var body = "";

            if (response.statusCode !== 200) {
                request.abort();
                //Status Code Error
                scraperEmitter.emit('error', new Error("There was an error getting Prices from shirts4mike. (" + http.STATUS_CODES[response.statusCode] + ")"));
            }

            //Read the data
            response.on('data', function (chunk) {
                body += chunk;
                scraperEmitter.emit("data", chunk);
            });

            response.on('end', function () {
                if (response.statusCode === 200) {
                    try {
                        scraperEmitter.emit('end', body);
                    } catch (error) {
                        scraperEmitter.emit('error', error);
                    }

                }
            }).on("error", function (error) {
                scraperEmitter.emit("error", error);
            });
        });
    }else{
        scraperEmitter.emit("error", new Error("The url string cannot be an empty string"));
    }
}

function parseNode(node) {
    return {
        title: node.get("title").text(),
        link: node.get("link").text(),
        publishDate: new Date(node.get("pubDate").text()),
        author: node.get("creator").text()
    }
}


util.inherits(Scraper, EventEmitter);

module.exports = Scraper;

//Error File name scraper-error.log
//use eslint for error writing to output file using the current Date and Time to append the error to the output file

//Use a linting tool like ESLint to check your code for syntax errors and 
//to ensure general code quality. You should be able to run npm run lint to check your code.
//When an error occurs log it to a file scraper-error.log .
// It should append to the bottom of the file 
//with a time stamp and error e.g. [Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>



/*
* This callback is displayed as a global member
* @callback requestCallback
* */