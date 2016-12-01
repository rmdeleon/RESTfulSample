# RESTfulSample

## Summary

This project allows a user to visualize all their spending. The data can be aggregated by day, month or year. Other options allow the user to customize the data displayed.

It consists of 2 files: 

1 - [index.html](https://github.com/rmdeleon/RESTfulSample/blob/master/index.html). Main HTML page
2 - [demo.js](https://github.com/rmdeleon/RESTfulSample/blob/master/src/demo.js). Contains all the JavaScript code

## Requirements

This project can be tested in any modern browser. 
Some of the JavaScript features may not be compatible with older Browsers like IE.
It was tested in Chrome and Safari on Mac OSX.

## How to test?

Clone Repository and, from the local folder, open index.html on a browser. 

The user will be presented with a list of options on how to display their transaction data.
A table named *Transactions List* will display the transactions. A Total and Average rows are included at the end. The table is scrollable, so make sure to scroll on top of the table to see all data.

The options available are:
**1. Aggregate by:** day, month or year. Default aggregation is month.
**2. Ignore Donuts**. When this option is checked, all donut-related transactions will be ignored. 
**3. Ignore Credit Card Transactions**. When this option is checked, Credit Card transactions will be excluded and a new table named *Ignored Credit Card Transactions List* will be displayed at the bottom of the page highlighting the credit card transactions that were excluded. 

## Libraries Used
Google's DataTable Visualization is used to display the table. 