/**
 * Function that an XHR request to get transactions from the server
 * when done it calls {#processTransactionData}
 */
function getTransactions() {
    var fnDisplayError = function (e) {
        document.getElementById("content").textContent = "An error has occurred: " + e;
    };
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://2016.api.levelmoney.com/api/v2/core/get-all-transactions", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onloadend = function () {
        try {
            processTransactionData(JSON.parse(this.response));
        } catch (e) {
            fnDisplayError(e);
        }
    };
    xhr.onerror = function (e) {
        fnDisplayError(e);
    };
    var args = {"args": {"uid":  1110590645, "token":  "61C950D69F43B5A24603B02307549DB2", "api-token":  "AppTokenForInterview", "json-strict-mode": false, "json-verbose-response": false}};
    xhr.send(JSON.stringify(args));
}

/**
 * Function that checks if a transaction is valid
 * @param transaction the transaction object
 * @param ccIgnoreTransIds Array with lot of invalid transactions
 * @returns {boolean} whether the transaction is valid
 */
function isValidTransaction(transaction, ccIgnoreTransIds) {
    if (document.getElementById("ignoreDonuts").checked) {
        var m = transaction.merchant;
        if (m === "Krispy Kreme Donuts" || m === "DUNKIN #336784") {
            return false;
        }
    }

    if (document.getElementById("ignoreCC").checked) {
        if (ccIgnoreTransIds.includes(transaction["transaction-id"])) {
            return false;
        }
    }

    return true;
}

/**
 * Processes the transaction data obtained from the server to generate the data that needs to be displayed to the user.
 * when done it calls {#renderGoogleTable}
 * @param transData the transaction data
 */
function processTransactionData(transData) {
    var aggData = {}, // contains the aggregated transactions data {"2014": {spent: 2, income: 3}, "2015": {spent:5, income: 4}, ...}
        ccTempData = [], // contains temporary transactions
        ccIgnoreData = {}, // contains the aggregated transactions data for credit card transactions
        ccIgnoreTransIds = []; // contains the final list of transaction IDs to ignore

    // first examine all transactions to find those that are credit card transactions and may need to be ignored
    // credit card payments will consist of two transactions with opposite amounts (e.g. 5000000 centocents and -5000000 centocents) within 24 hours of each other.
    if (document.getElementById("ignoreCC").checked) {
        transData.transactions.forEach(function (obj) {
            var date = new Date(obj["clear-date"]), // parse transaction date
                transId = obj["transaction-id"],
                amount = obj.amount,
                fnIgnoreTransaction = function (date, spent, income, transId) {
                    ccIgnoreData[date.toISOString().slice(0, 19).replace("T", " - ")] = {"spent": spent / 10000, "income": income / 10000};
                    ccIgnoreTransIds.push(transId);
                };

            if (amount > 0) { //income

                // remember any positive transaction so we can check later
                ccTempData.push({"date": date, "income": amount, "trans-id": transId});
            } else { //spent

                //check against existing positive transactions list to find a matching one
                for (var i = 0; i < ccTempData.length; i++) {
                    var o = ccTempData[i];
                    if (amount + o.income === 0 && // transactions have opposite amounts
                        Math.abs(date - o.date) < 86400000) { // transactions are within a day of each other

                        //matching transaction
                        fnIgnoreTransaction(o.date, 0, o.income, o["transaction-id"]);

                        //we found a matching transaction, add both transaction IDs so we can ignore them
                        //current transaction
                        fnIgnoreTransaction(date, amount, 0, transId);

                        // Remove existing transaction as it has found its match
                        ccTempData.splice(i, 1);

                        // break as there is no need to keep searching
                        break;
                    }
                }
            }
        });
    }


    // Now, loop through all transactions and start aggregating data at the day, month or year depending on the user selection.
    // al data would be stored in "aggData" for later display
    transData.transactions.forEach(function (obj) {
        if (isValidTransaction(obj, ccIgnoreTransIds)) {
            var date = new Date(obj["clear-date"]), // parse transaction date
                dateLength = 0,
                amount = obj.amount / 10000; //convert centocents to dollars

            //Calculate the length of the key depending on what is aggregated by

            if (document.getElementById("aggregateBy_day").checked) {
                dateLength = 10; // create month key with format YYYY-MM-DD
            } else if (document.getElementById("aggregateBy_month").checked) {
                dateLength = 7; // create month key with format YYYY-MM
            } else if (document.getElementById("aggregateBy_year").checked) {
                dateLength = 4;// create month key with format YYYY
            }
            var aggKey = date.toISOString().slice(0, dateLength);

            // create element for current month if needed
            aggData[aggKey] = aggData[aggKey] || {"spent": 0, "income": 0};

            if (amount > 0) { //income
                aggData[aggKey].income += amount;

                // cc transactions
                ccTempData.push({"date": date, "income": amount});
            } else { //spent
                aggData[aggKey].spent += amount;

            }
        }
    });

    // render transactions table
    renderGoogleTable(aggData, "content", true, true);

    // render credit card transactions table if needed
    var ccDiv = document.getElementById("ccTransactionsSection");
    if (document.getElementById("ignoreCC").checked) {
        ccDiv.style = "display:block";
        renderGoogleTable(ccIgnoreData, "cc", false, false);
    } else {
        ccDiv.style = "display:none";
    }
}

/**
 * Renders a standard table using a google visualization
 * @param transData conains the data to be displayed
 * @param divName the name of the container div where the table should be rendered
 * @param addTotals whether to add total rows
 * @param addBalance whether to add balance column
 */
function renderGoogleTable(transData, divName, addTotals, addBalance) {

    google.charts.load("current", {"packages":["table"]});
    google.charts.setOnLoadCallback(function () {

        var data = new google.visualization.DataTable(),
            totalIncome = 0,
            totalSpent = 0,
            transCount = 0;

        // initialize columns
        data.addColumn("string", "Date");
        data.addColumn("number", "Spent");
        data.addColumn("number", "Income");
        if (addBalance) {
            data.addColumn("number", "Balance");
        }

        // Define local function to add a row so that we don't duplicate the code
        var fnAddRow =  function (name, income, spent) {
            var r = [];

            // create row array
            r[0] = name;
            r[1] = spent;
            r[2] = income;
            if (addBalance) {
                r[3] = spent + income;
            }

            // add row
            data.addRow(r);
        };

        // Loop through aggregated transactions data to add a row for each month/year/day
        Object.keys(transData).forEach(function (row) {
            var o = transData[row];

            // add row
            fnAddRow(row + "", o.income, o.spent);

            // calculate totals for later
            totalIncome += o.income;
            totalSpent += o.spent;
            transCount++;
        });

        if (addTotals) {
            // Add Average row
            fnAddRow("Average", totalIncome/transCount, totalSpent/transCount);

            // Add total row
            fnAddRow("Total", totalIncome, totalSpent);
        }

        var table = new google.visualization.Table(document.getElementById(divName));

        var formatter = new google.visualization.NumberFormat(
            {prefix: "$", negativeColor: "red", negativeParens: true});
        formatter.format(data, 1); // Apply formatter to second column
        formatter.format(data, 2); // Apply formatter to third column
        if (addBalance) {
            formatter.format(data, 3); // Apply formatter to fourth column
        }

        table.draw(data, {showRowNumber: false, page: 'enable', pageSize: 100, allowHtml: true});
    });
}