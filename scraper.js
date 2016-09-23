'use strict';
/**
 * content-scraper
 * Scraping module for shopping site.
 *
 *@name Scraper
 *@function
 *@param {String} url - The url of the site to scrape
 */

var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Xray = require("x-ray");
var xRay = Xray();
var dataDir = "/data";
var json2csv = require("json2csv");
var Log = require('log');
var log = new Log('error', fs.createWriteStream('./scraper-error.log'));



function Scraper(url){
    //The scraper should generate a folder called data if it doesn’t exist.
    if (!fs.existsSync('.' + dataDir)){
        fs.mkdirSync('.' + dataDir);
    }
    EventEmitter.call(this);

    var scraperEmitter = this;
    //Check if the url is of type string
    if(typeof url !== 'string'){
        scraperEmitter.emit('error', new Error('The url is not a string '));
        log.info('The url is not a string ');
        throw new Error ("The url is not a string ");
    }
    //If the url is not empty and has a type of string
    if(url !== "" && typeof url === 'string') {
        xRay(url, 'ul.products li',
            [{
              'title': undefined,
              'price': undefined,
              'imageUrl': undefined,
              'href': 'a@href',
              'time': undefined
        }])(function(error, data){
            if(error) {
                log.error(error.message);
                scraperEmitter.emit('error', new Error(error));
            }
            if(typeof data !== 'object' || data == null) {
                log.error('The return data isn\'t a object or is null ');
                scraperEmitter.emit('error', new Error("The result isn't an object"));
                return 1;
            }
            data.forEach(function (shirt) {
                var now = new Date();
                xRay(shirt['href'], 'div.section.page',
                    {
                        'title': '.shirt-details h1',
                        'price': 'span.price',
                        'imageUrl': '.shirt-picture img@src'
                    })(function (err, newData) {
                        if(err){
                            log.error(err, err.message);
                            scraperEmitter.emit('error', err.message);
                        }
                        shirt.title = newData.title.replace(/(\$+)([0-9]+)/g, "");
                        shirt.price = newData['price'];
                        shirt.imageUrl = newData['imageUrl'];
                        shirt.time = now.toLocaleTimeString('en-US', {hour12: false});
                        addResult(shirt, data.length, scraperEmitter);
                    });
            });
        });
    }else{
        scraperEmitter.emit('error', new Error('The url string is empty '));
        log.info('The url string is empty ');
        //scraperEmitter.emit("error", new Error("The url string cannot be an empty string"));
        throw new Error ('The url string is empty ');
    }
}

var i = 0;
var result = [];

function addResult(shirt, length) {
    result.push(shirt);
    i++;
    if(i === length){
        printOutResult(result);
    }
}

function printOutResult(result) {
    var fields = ['title', 'price', 'imageUrl', 'href', 'time'];
    var fieldNames = ['Title', 'Price $', 'ImageURL', 'URL', 'Time'];
    var csv = json2csv({ data: result, fields: fields , fieldNames: fieldNames });
    var fileNameDate = new Date().toISOString().slice(0,10);
    fs.writeFile('.' + dataDir + '/'+ fileNameDate +'.csv', csv, function(err) {
        if(err){
            log.error('Error Writing to file %s %s', fileNameDate, err.message);
            throw new Error (err);
        }
        console.log('File saved Successfully');
    });
}


util.inherits(Scraper, EventEmitter);

module.exports = Scraper;

//Error File name
//use eslint for error writing to output file using the current Date and Time to append the error to the output file
//Use a linting tool like ESLint to check your code for syntax errors and 
//to ensure general code quality. You should be able to run npm run lint to check your code.


/*
* This callback is displayed as a global member
* @callback requestCallback
* @exports Scraper
* */
