function getTransactions() {
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://2016.api.levelmoney.com/api/v2/core/get-all-transactions", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onloadend = function() {
		cleanData(JSON.parse(this.response));
	};
	xhr.onerror = function(err) {
	    document.getElementById('content').textContent = "eror";
	};
	args = {"args": {"uid":  1110590645, "token":  "61C950D69F43B5A24603B02307549DB2", "api-token":  "AppTokenForInterview", "json-strict-mode": false, "json-verbose-response": false}};
	xhr.send(JSON.stringify(args));
}

function cleanData(transData) {
	var aggData = {}; // Aggregated data {"2014": {spent: 2, income: 3}, "2015": {spent:5, income: 4}, ...}
	
	transData.transactions.forEach(function(obj) {
	      var date = new Date(obj['clear-date']), // parse transaction date
	      	  monthKey = date.toISOString().slice(0, 7); // create month key with format YYYY-MM
	      
	      // create element for current month if needed
	      aggData[monthKey] = aggData[monthKey] || {'spent':0, "income":0}; 
	      
	      if (obj.amount > 0) { //income
	    	  aggData[monthKey].income += obj.amount;
	      } else { //spent
	    	  aggData[monthKey].spent += obj.amount;
	      }
	  });
	
	// render the table
	renderGoogleTable(aggData);
}

function renderGoogleTable(transData) {

    google.charts.load('current', {'packages':['table']});
    google.charts.setOnLoadCallback(function() { drawTable(transData); });
}


function drawTable(transData) {
  var data = new google.visualization.DataTable();  

  // initialize columns
  data.addColumn('string', "Date");
  data.addColumn('string', "Spent");
  data.addColumn('string', "Income");
  
  Object.keys(transData).forEach(function(row) {
      var o = transData[row],
          r = [];
      r[0] = row + '';
      r[1] = o.spent + '';
      r[2] = o.income + '';
      
      data.addRow(r);
  });

  var table = new google.visualization.Table(document.getElementById('content'));

  table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
}