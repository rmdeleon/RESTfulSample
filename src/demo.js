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
            cleanData(JSON.parse(this.response));
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

function isValidTransaction(transaction) {
    if (document.getElementById("ignoreDonuts").checked) {
        var m = transaction.merchant;
        if (m === "Krispy Kreme Donuts" || m === "DUNKIN #336784") {
            return false;
        }
    }
    return true;
}

function cleanData(transData) {
    var aggData = {}; // Aggregated data {"2014": {spent: 2, income: 3}, "2015": {spent:5, income: 4}, ...}

    transData.transactions.forEach(function (obj) {
        if (isValidTransaction(obj)) {
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
            } else { //spent
                aggData[aggKey].spent += amount;
            }
        }
    });

    // render the table
    renderGoogleTable(aggData);
}

function renderGoogleTable(transData) {

    google.charts.load("current", {"packages":["table"]});
    google.charts.setOnLoadCallback(function () {

        var data = new google.visualization.DataTable(),
            currencyFormatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            });

        // initialize columns
        data.addColumn("string", "Date");
        data.addColumn("string", "Spent");
        data.addColumn("string", "Income");
        data.addColumn("string", "Balance");

        var fnCreateRowObject = function (num) {
            var obj = {};
            obj.v = num + "";
            obj.f = currencyFormatter.format(num);
            return obj;
        }

        Object.keys(transData).forEach(function (row) {
            var o = transData[row],
                r = [];
            r[0] = row + "";
            r[1] = fnCreateRowObject(o.spent);
            r[2] = fnCreateRowObject(o.income);
            r[3] = fnCreateRowObject(o.spent + o.income);

            data.addRow(r);
        });

        var table = new google.visualization.Table(document.getElementById("content"));

        table.draw(data, {showRowNumber: false, width: "100%", height: "100%"});

    });
}