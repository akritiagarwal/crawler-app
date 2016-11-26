var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');

var START_URL = "http://www.medium.com";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var finalPageList = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
    finalPageList.push(nextPage);
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     var $ = cheerio.load(body);
     fetchingLinks($);
     // In this short program, our callback is just calling crawl()
     callback();
  });
}

function fetchingLinks($) {
    var relativeLinks = $("a[href^='/']");
    var absoluteLinks = $("a[href^='http']")
    console.log("Found " + relativeLinks.length + " relative links on page");
    console.log("Found " + absoluteLinks.length + "absolute links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
        fs.appendFileSync('/tmp/rentomojoFile.csv',(baseUrl + $(this).attr('href'))  + '\n');
    });
    absoluteLinks.each(function() {
        pagesToVisit.push($(this).attr('href'));
        fs.appendFileSync('/tmp/rentomojoFile.csv',($(this).attr('href'))  + '\n');
    });
}
