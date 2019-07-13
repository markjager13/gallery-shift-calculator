/* 
TODO 
- review/refactor get24hTime...could be reviewed more
- input validation..could be improved...staffnumber validation?
- generate statistics sheet...improve?
- add results css animations
- ensure app is mobile responsive
  - how to get it to work on safari
- create gitHub repository for this project
- link codesandbox/github/neglify
LEARNING 
- HTML/CSS/JS basics
- JS date objects
- difference between named vs anonymous functions
- difference between onclick and addEventListener
- using ceil/round/floor for rounding up vs down
- table generation
- selecting html table for clipboard
- using css to print
- eslint
*/

var calc = document.getElementById("calculateButton");
var clear = document.getElementById("resetButton");
var copyT = document.getElementById("selectButton");

calc.addEventListener("click", calculate);
clear.addEventListener("click", clearBox);
copyT.addEventListener("click", selectElementContents);

function calculate() {
  // variables
  var startValue, endValue, staffNum;
  var milStartTime, milEndTime;
  var startDate, endDate, offset;
  var timesArray = [];
  var aList = [];

  // reset results
  document.getElementById("listTable").innerHTML = "";
  document.getElementById("resultsTable").innerHTML = "";
  document.getElementById("resultsSheet").innerHTML = "";

  // get text input from user
  startValue = document.getElementById("startTime").value;
  endValue = document.getElementById("endTime").value;
  staffNum = document.getElementById("intervalByStaff").value;

  checkInput(startValue);
  checkInput(endValue);
  //checkInput(staffNum);

  // translate user time from 12h into 24h
  milStartTime = get24hTime(startValue);
  milEndTime = get24hTime(endValue);

  // create date objects with 24hour user input times
  startDate = new Date("2019 " + milStartTime);
  endDate = new Date("2019 " + milEndTime);
  offset = calculateByStaff(staffNum, startDate, endDate);

  // initialize array with times + interval
  timesArray = fillArray(startDate, endDate, offset);

  // format times in printable format
  aList = createShifts(timesArray);

  // results...
  var listSel = document.getElementById("listSelect").checked;
  var tableSel = document.getElementById("tableSelect").checked;
  var sheetSel = document.getElementById("sheetSelect").checked;

  if (listSel) {
    // testing list print
    var list = document.getElementById("listTable");
    if (startValue && endValue !== "") {
      generateTableHead1(list, aList);
      generateTable1(list, aList);
    }
  }

  if (tableSel) {
    // testing table print
    var table = document.getElementById("resultsTable");
    if (startValue && endValue !== "") {
      generateTableHead2(table, aList);
      generateTable2(table, aList);
    }
  }

  if (sheetSel) {
    // testing table print
    var table2 = document.getElementById("resultsSheet");
    if (startValue && endValue !== "") {
      generateTable3(table2, aList);
    }
  }
}

// validate user input times - am/pm
function checkInput(formInput) {
  // Things this needs to do...
  // 1. not null
  // 2. has colon notation
  // 3. has am or pm
  // 4. hours between 1 and 12
  // 5. minutes between 00 and 59
  // 6. no letters...immediately breaks from chain of if statements
  // 7. pm not entered as start value...checked in calculateByStaff

  if (formInput !== "") {
    if (formInput.indexOf(":") > 0) {
      if (formInput.indexOf("am") > 0 || formInput.indexOf("pm") > 0) {
        formInput = formInput.replace("am", "").replace("pm", "");
        var inputHours = formInput.split(":")[0];
        var inputMinutes = formInput.split(":")[1];
        if (inputHours >= 1 && inputHours <= 12) {
          if (inputMinutes >= 0 && inputMinutes <= 59) {
            return true;
          }
        }
      }
    }
  }
  console.log("Error: Incorrect input.");
  return false;
}

// translate into 24h/military time
function get24hTime(timeInput) {
  // casts input value as string, sets to lower case, removes spaces
  timeInput = String(timeInput)
    .toLowerCase()
    .replace(/\s/g, "");
  // acknowledges am/pm occurs in input string and sets to appropriate variable
  var has_am = timeInput.indexOf("am") >= 0;
  var has_pm = timeInput.indexOf("pm") >= 0;
  // first strip off the am/pm, leave it either hour or hour:minute
  timeInput = timeInput.replace("am", "").replace("pm", "");
  // if hour, convert to hour:00
  if (timeInput.indexOf(":") < 0) timeInput = timeInput + ":00";
  // now it's hour:minute
  // we add am/pm back if striped out before
  if (has_am) timeInput += " am";
  if (has_pm) timeInput += " pm";
  // now its either hour:minute, or hour:minute am/pm
  // put it in a date object, it will convert to 24 hours format for us
  var dObj = new Date("1/1/2019 " + timeInput);
  // make hours and minutes double digits
  // uses anonymous function assigned to doubleDigits
  var doubleDigits = function(n) {
    return parseInt(n, 10) < 10 ? "0" + n : String(n);
  };
  return doubleDigits(dObj.getHours()) + ":" + doubleDigits(dObj.getMinutes());
}

// calculates shift duration based on number of staff
function calculateByStaff(sNum, sDate, eDate) {
  if (sDate > eDate) {
    console.log("Error: end date entered as start.");
  }
  var totalTime = eDate - sDate;
  var offsetResult = totalTime / sNum;
  return offsetResult; // returned as miliseconds
}

// initialize array with specific dateObjs
function fillArray(startDate, endDate, offset) {
  var tArray = [];
  var shiftTime = new Date(startDate.getTime());
  do {
    tArray.push(shiftTime);
    shiftTime = new Date(shiftTime.getTime() + offset);
  } while (shiftTime <= endDate);
  return tArray;
}

// loop through array, get time from date object, print results
function createShifts(timesArray) {
  var arrayOfShifts = [];
  var start, end;
  var shiftLength;

  for (var i = 0; i < timesArray.length; i++) {
    start = timesArray[i];
    if (i === timesArray.length - 1) {
      break;
    } else {
      end = timesArray[i + 1];
    }

    var startHour = start.getHours();
    var startMins = start.getMinutes();
    var startHourToCalc = startHour;
    var sMinToCalc = startMins;
    startHour = ((startHour + 11) % 12) + 1;
    if (document.getElementById("roundedTimes").checked) {
      startMins = Math.round(startMins / 5) * 5;
      sMinToCalc = startMins;
      if (startMins === 60) {
        startHour++;
        startMins = 0;
      }
    }
    if (startMins.toString().length === 1) startMins = "0" + startMins;

    var endHour = end.getHours();
    var endMins = end.getMinutes();
    var endHourToCalc = endHour;
    var endMinToCalc = endMins;
    endHour = ((endHour + 11) % 12) + 1;
    if (document.getElementById("roundedTimes").checked) {
      endMins = Math.round(endMins / 5) * 5;
      endMinToCalc = endMins;
      if (endMins === 60) {
        endHour++;
        endMins = 0;
      }
    }
    if (endMins.toString().length === 1) endMins = "0" + endMins;

    shiftLength = getShiftLength(
      startHourToCalc,
      sMinToCalc,
      endHourToCalc,
      endMinToCalc
    );

    var startTime = startHour + ":" + startMins;
    var endTime = endHour + ":" + endMins;

    var shift = startTime + " - " + endTime;

    arrayOfShifts.push([shift, shiftLength]);
    start = end;
  }
  console.log(arrayOfShifts);
  return arrayOfShifts;
  //return arrayOf2DShifts;
}

function getShiftLength(sHour, sMin, eHour, eMin) {
  console.log(eHour);
  console.log(eMin);
  var offsetInMins;
  var hourDiff;

  if (eHour > sHour) {
    hourDiff = eHour - sHour;
    if (hourDiff > 1) {
      sMin = 60 - sMin;
      offsetInMins = sMin + eMin + 60;
    } else if (hourDiff === 1) {
      sMin = 60 - sMin;
      offsetInMins = sMin + eMin;
    }
  } else {
    offsetInMins = eMin - sMin;
  }
  console.log(offsetInMins);
  return offsetInMins;
}

// clears results box
function clearBox() {
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
  document.getElementById("intervalByStaff").value = "";
  document.getElementById("listSelect").checked = true;
  document.getElementById("tableSelect").checked = false;
  document.getElementById("sheetSelect").checked = false;
  document.getElementById("listTable").innerHTML = "";
  document.getElementById("resultsTable").innerHTML = "";
  document.getElementById("resultsSheet").innerHTML = "";
  // cleared table id instead of results div to fix bug...
  // clearing div deleted table?..could not submit 2nd/3rd/etc. try
  //document.getElementById("results").innerHTML = "";
}

// generates table head
function generateTableHead1(table) {
  var thead = table.createTHead();
  var row = thead.insertRow();

  var cell1 = row.insertCell();
  var cell2 = row.insertCell();
  var text1 = document.createTextNode("Time");
  var text2 = document.createTextNode("Length");

  cell1.appendChild(text1);
  row.appendChild(cell1);
  cell2.appendChild(text2);
  row.appendChild(cell2);
}

// generates table head2
function generateTableHead2(table) {
  var thead = table.createTHead();
  var row = thead.insertRow();

  var cell1 = row.insertCell();
  var cell2 = row.insertCell();
  var text1 = document.createTextNode("Time");
  var text2 = document.createTextNode("Staff");

  cell1.appendChild(text1);
  row.appendChild(cell1);
  cell2.appendChild(text2);
  row.appendChild(cell2);
}

// generates table
function generateTable1(table, arrayData) {
  for (var i = 0; i < arrayData.length; i++) {
    var row = table.insertRow();
    var cell1 = row.insertCell();
    var cell2 = row.insertCell();
    var textTime = document.createTextNode(arrayData[i][0]);
    var textLength = document.createTextNode(arrayData[i][1]);
    cell1.appendChild(textTime);
    row.appendChild(cell1);
    cell2.appendChild(textLength);
    row.appendChild(cell2);
  }
}

// generates table
function generateTable2(table, arrayData) {
  for (var i = 0; i < arrayData.length; i++) {
    var row = table.insertRow();
    var cell1 = row.insertCell();
    var cell2 = row.insertCell();
    var textTime = document.createTextNode(arrayData[i][0]);
    var textBlank = document.createTextNode("");
    cell1.appendChild(textTime);
    row.appendChild(cell1);
    cell2.appendChild(textBlank);
    row.appendChild(cell2);
  }
}

function generateTable3(table, arrayData) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;

  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
  //var header = document.createElement("header");
  var header =
    "<tr><th colspan=3 id=statsHeader>Overlook Statistics</th></tr><tr><th colspan=3><h4>Date: " +
    today +
    "</h4></th></tr><tr><th>Time</th><th>Notes</th><th>Total</th></tr>";

  var tblBody = document.createElement("tbody");

  // creating all cells
  for (var i = 0; i < arrayData.length; i++) {
    // creates a table row
    var row = document.createElement("tr");

    for (var j = 0; j < 3; j++) {
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      var cell = document.createElement("td");
      if (j === 0) {
        var cellText = document.createTextNode(arrayData[i][0]);
      } else {
        cellText = document.createTextNode("");
      }

      cell.appendChild(cellText);
      row.appendChild(cell);
    }

    // add the row to the end of the table body
    tblBody.appendChild(row);
  }
  // This is for the quick solution
  tbl.innerHTML = header;

  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);

  // appends <table> into <body>
  table.appendChild(tbl);
  // sets the border attribute of tbl to 2;
  tbl.setAttribute("class", "statsSheet");
}

// trying to copy table to clipboard
// SUCCESS!!...now figure out HTF it works
function selectElementContents(el) {
  var selection = document.getElementById("resultsTable");

  var body = document.body,
    range,
    sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(selection);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(selection);
      sel.addRange(range);
    }
  } else if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(selection);
    range.select();
  }
}
