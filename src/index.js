/* 
TODO 
- add help button underneath h1
- add results css animations
- ensure app is mobile responsive
  - how to get it to work on safari
- link codesandbox/github/netlify
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

const calc = document.getElementById("calculateButton");
const clear = document.getElementById("resetButton");
const copyT = document.getElementById("selectButton");

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

  // reset results before each new calculation
  document.getElementById("listTable").innerHTML = "";
  document.getElementById("resultsTable").innerHTML = "";
  document.getElementById("resultsSheet").innerHTML = "";
  document.getElementById("selectButton").style.display = "none";
  document.getElementById("printInst").style.display = "none";


  // get text input from user
  startValue = document.getElementById("startTime").value;
  endValue = document.getElementById("endTime").value;
  staffNum = document.getElementById("intervalByStaff").value;

  // input validation
  checkInput(startValue);
  checkInput(endValue);
  checkStaffInput(staffNum);

  // translate user time from 12h into 24h
  milStartTime = get24hTime(startValue);
  milEndTime = get24hTime(endValue);

  // create date objects with 24hour user input times
  startDate = new Date("2019 " + milStartTime);
  endDate = new Date("2019 " + milEndTime);

  // calculate the shift length based on staff num, returns time in miliseconds
  offset = calculateByStaff(staffNum, startDate, endDate);

  // initialize array with times + interval
  timesArray = fillArray(startDate, endDate, offset);

  // format times in printable format
  aList = createShifts(timesArray);

  // generate results based on selected format
  var listSel = document.getElementById("listSelect").checked;
  var tableSel = document.getElementById("tableSelect").checked;
  var sheetSel = document.getElementById("sheetSelect").checked;

  // render copy button if list/table selected
  if (listSel || tableSel) {
    if (startValue && endValue !== "") {
      copyT.style.display = "block";
    }
  }

  // render print instructions if sheet selected
  if (sheetSel) {
    if (startValue && endValue !== "") {
      document.getElementById("printInst").style.display = "block";
    }
  }

  // list format with shift length duration
  if (listSel) {
    var list = document.getElementById("listTable");
    if (startValue && endValue !== "") {
      generateTableHead1(list, aList);
      generateTable1(list, aList);
    }
  }

  // table format with fillable staff column
  if (tableSel) {
    var table = document.getElementById("resultsTable");
    if (startValue && endValue !== "") {
      generateTableHead2(table, aList);
      generateTable2(table, aList);
    }
  }

  // sheet format for statistics recording 
  if (sheetSel) {
    var table2 = document.getElementById("resultsSheet");
    if (startValue && endValue !== "") {
      generateTable3(table2, aList);
    }
  }
}

// validate user input times - am/pm
/*
   Things this needs to do...
   1. not null
   2. has colon notation
   3. has am or pm
   4. hours between 1 and 12
   5. minutes between 00 and 59
   6. no letters...immediately breaks from chain of if statements
   7. pm not entered as start value...checked in calculateByStaff
*/
function checkInput(formInput) {
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

// validate staff number input (should not be less than 0)
function checkStaffInput(formInput) {
  if (formInput <= 0) {
    console.log("Error: Incorrect input.");
    return false;
  }
  else {
    return true;
  }
}

// translate into 24h time
function get24hTime(timeInput) {
  timeInput = String(timeInput)
    .toLowerCase()
    .replace(/\s/g, "");
  var has_am = timeInput.indexOf("am") >= 0;
  var has_pm = timeInput.indexOf("pm") >= 0;
  timeInput = timeInput.replace("am", "").replace("pm", "");
  if (timeInput.indexOf(":") < 0) timeInput = timeInput + ":00";
  if (has_am) timeInput += " am";
  if (has_pm) timeInput += " pm";
  var dObj = new Date("2019 " + timeInput);
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

// loop through array, get time from date object, return results
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
  return arrayOfShifts;
}

// gets length of each shift, return as minutes
function getShiftLength(sHour, sMin, eHour, eMin) {
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
  document.getElementById("selectButton").style.display = "none";
  document.getElementById("printInst").style.display = "none";
}

// generates table head1 for list option
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

// generates table head2 for table option
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

// generates table for list option
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

// generates table2 for table option
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

// generates table3 for sheet option
function generateTable3(table, arrayData) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;

  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
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
  tbl.innerHTML = header;

  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);

  // appends <table> into <body>
  table.appendChild(tbl);
  // sets the border attribute of tbl to 2;
  tbl.setAttribute("class", "statsSheet");
}

// selects table allowing it to be copied to clipboard
function selectElementContents(el) {
  var selection = document.getElementById("results");
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
      document.execCommand("copy");
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
