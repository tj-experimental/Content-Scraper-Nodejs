'use strict';

//<editor-fold desc="Description">
/*----
Use a third party npm package to create an CSV file. 
You should be able to explain why you chose that package.

If the site is down, an error message describing the issue should appear in the console. 

This is to be tested by disabling wifi on your device.

If the data file for today already exists it should overwrite the file.

Code documentation*/
//</editor-fold>

/**
 * content-scraper
 * Scraping module for shopping site.
 *
 *@name Scraper
 *@function
 *@param {String|Object} url - The url of the site to scrape
 *@return {Object} data - the returned object
 *@return {Object} newData - the returned object
 *@param {String} dir - the location for the output
 */

const http = require('http');
const fs = require('fs');
const EventEmitter = require("events").EventEmitter;
const util = require("util");
const Xray = require("x-ray");
const xRay = Xray();
var dir = './data';
const json2csv = require('json2csv');



function Scraper(url){
    //The scraper should generate a folder called data if it doesn’t exist.
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    EventEmitter.call(this);

    var scraperEmitter = this;

    if(typeof url !== 'string'){
        scraperEmitter.emit('error', new Error("The url type is not a string"));
    }
    if(url !== "" && typeof url === 'string') {
        xRay(url, 'ul.products li',
            [{
              'title': '_',
              'price': '_',
              'imageUrl': '_',
              'href': 'a@href',
              'time': '_'
        }])(function(error, data){
            if(error) {
                scraperEmitter.emit('error', new Error(error.message));
            }
            if(typeof data !== 'object' || data == null) {
                scraperEmitter.emit('error', new Error("The result isn't an object"));
                return;
            }
            data.forEach(function (shirt) {
                var now = new Date();
                xRay(shirt['href'], 'div.section.page',
                    {
                        'title': '.shirt-details h1',
                        'price': 'span.price',
                        'imageUrl': '.shirt-picture img@src'
                    })(function (err, newData) {
                        if(err){scraperEmitter.emit('error', "Error scraping page :" + shirt['href']);}
                        shirt.title = newData.title.replace(/(\$+)([0-9]+)/g, "");
                        shirt.price = newData['price'];
                        shirt.imageUrl = newData['imageUrl'];
                        shirt.time = now.toLocaleTimeString('en-US', {hour12: false});
                        addResult(shirt, data.length);
                    });
            });
        });
    }else{
        scraperEmitter.emit("error", new Error("The url string cannot be an empty string"));
    }
}

var i = 0;
var result = [];

function addResult(shirt, length) {
    result.push(shirt);
    i++;
    if(i == length){
        printOutResult(result);
    }
}

function printOutResult(result) {
    var fields = ['title', 'price', 'imageUrl', 'href', 'time'];
    var fieldNames = ['Title', 'Price ($)', 'ImageURL', 'URL', 'Time'];
    var csv = json2csv({ data: result, fields: fields , fieldNames: fieldNames });
    var fileNameDate = new Date().toISOString().slice(0,10);
    fs.writeFile( dir + '/'+ fileNameDate +'.csv', csv, function(err) {
        if(err)throw new Error (err.message);
        console.log('File saved Successfully');
    });
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
* @exports Scraper
* */



// // Callback interface
// scrapeIt("http://ionicabizau.net", {
//         // Fetch the articles
//         articles: {
//             listItem: ".article"
//             , data: {
//
//                 // Get the article date and convert it into a Date object
//                 createdAt: {
//                     selector: ".date",
//                     convert: x => new Date(x)
//             }
//
//             // Get the title
//             , title: "a.article-title"
//
//             // Nested list
//             , tags: {
//                 listItem: ".tags > span"
//             }
//
//             // Get the content
//             , content: {
//                 selector: ".article-content"
//                 , how: "html"
//             }
//         }
//     },// Fetch the blog pages
//         pages : {
//             listItem: "li.page",
//                 name: "pages",
//                 data: {
//                       title: "a",
//                       url: {
//                       selector: "a",
//                       attr: "href"
//                 }
//             }
//         },
//         // Fetch some other data from the page
//      title: ".header h1"
//             , desc: ".header h2"
//             , avatar: {
//             selector: ".header img"
//                 , attr: "src"
//         }
//     }, (err, page) => {
//             console.log(err || page);
//         });
//
