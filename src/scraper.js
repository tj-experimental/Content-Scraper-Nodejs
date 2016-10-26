'use strict';
/**
 * content-scraper
 * Scraping module for shopping site.
 *
 *@name scrape
 *@function
 *@param {String} url - The url of the site to scrape
 *@global process
 */

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    os = require('os'),
    Xray = require('x-ray'),
    xRay = Xray(),
    dataDir = '/data',
    json2csv = require('json2csv'),
    Log = require('log'),
    errorStream = fs.createWriteStream('./scrape-error.log', {flags: 'a'}),
    log = new Log('debug', errorStream),
    log2 = new Log('info'),
    /* global process */
    defaultLocation =  process.cwd(),
    filename = defaultLocation + dataDir;


var scrape = function (url){
    EventEmitter.call(this);

    var scraperEmitter = this;


    //Check if the url is of type string
    if ('string' !== typeof url) {
        scraperEmitter.emit('error', new Error('The url is not a string '));
        throw new Error('The url is not a string ');
    }
    //If the url is not empty and has a type of string
    if(url !== '' && typeof url === 'string') {
        xRay(url, 'ul.products li',
            [{'title': undefined,
                'price': undefined,
                'imageUrl': undefined,
                'href': 'a@href',
                'time': undefined
        }])(function(error, data){
            if(error) {
                log2.alert('An Error occurred while retrieving contents from %s. Check the scrape-error.log for more information',url);
                log.error( error.errno + ' ' + error.syscall +' Check connection: '+ error.message + os.EOL);
                scraperEmitter.emit('error', new Error(error.errno+' '+error.syscall+' Check connection: '+error.message));
            }
            if(typeof data !== 'object' || data == null) {
                log.info('The return data isn\'t an object or is null' + os.EOL);
                scraperEmitter.emit('error', new Error('The result isn\'t an object'));
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
                            log.error(err, err.message + os.EOL);
                            scraperEmitter.emit('error', err.message);
                        }
                        shirt.title = newData.title.replace(/(\$+)([0-9]+)/g, '');
                        shirt.price = newData['price'];
                        shirt.imageUrl = newData['imageUrl'];
                        shirt.time = now.toLocaleTimeString('en-US', {hour12: false});
                        addResult(shirt, data.length, scraperEmitter);
                    });
            });
        });
    }else{
        log2.info('The url string is empty ');
        scraperEmitter.emit('error', new Error('The url string is empty '));
        throw new Error ('The url string is empty ');
    }
};

var i = 0;
var result = [];

function addResult(shirt, length, scraperEmitter) {
    result.push(shirt);
    i++;
    if(i === length){
        scraperEmitter.emit('end', result);
    }
}

var print = function (result, new_dirname, new_fname) {
    var path;
    if (new_dirname !== undefined && typeof(new_dirname) == 'string' ){
        path = defaultLocation +'/'+ new_dirname;
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }else{
            log.error('Error Creating file in the location %s', path);
        }
    }else{
        //The scrape should generate a folder called data if it doesn’t exist.
        path = filename;
        if (!fs.existsSync(filename)){
            fs.mkdirSync(filename);
        }else{
            log.error('Error Creating the file in the location %s', path);
        }
    } 
    var fields = ['title', 'price', 'imageUrl', 'href', 'time'];
    var fieldNames = ['Title', 'Price $', 'ImageURL', 'URL', 'Time'];
    var csv = json2csv({ data: result, fields: fields , fieldNames: fieldNames });
    var date = new Date();
    var fileName = new Date(date + 'UTC') .toISOString().slice(0,10);
    if (new_fname !== undefined && new_fname.indexOf('.csv') == -1 && 
    typeof(new_dirname) == 'string' ){
        fileName = new_fname;
    }
    var outputPath = path + '/'+ fileName + '.csv';
    fs.writeFile(outputPath , csv, function(err) {
        if(err){
            log.error('Writing to file %s %s ' + os.EOL , path, err.message);
            throw new Error (err, path);
        }
        log2.info('File saved Successfully : %s/%s.csv',path, fileName);
    });
};


util.inherits(scrape, EventEmitter);

module.exports = { scrape, print };

//Error File name
//use eslint for error writing to output file using the current Date and Time to append the error to the output file
//Use a linting tool like ESLint to check your code for syntax errors and 
//to ensure general code quality. You should be able to run npm run lint to check your code.


/*
* This callback is displayed as a global member
* @callback requestCallback
* @exports scrape
* */
