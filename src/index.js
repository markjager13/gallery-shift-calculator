// Get DOM Elements
const form = document.querySelector(".formInput");
const reset = document.getElementById("resetButton");
const copy = document.getElementById("selectButton");
const animateMainSchedule = document.getElementById("mainScheduleFormat");
const animateStandardTable = document.getElementById("standardTableFormat");

// Events
form.addEventListener("submit", handleSubmit);
reset.addEventListener("click", clearAll);
copy.addEventListener("click", selectElementContents);

// Main submit/calculate function
function handleSubmit(event) {
  // prevent page reload
  event.preventDefault();

  // reset results before each new calculation
  clearAllResults();

  // get text input from user
  let start = document.getElementById("startTime").value;
  let end = document.getElementById("endTime").value;
  let staffNum = document.getElementById("staffNum").value;

  // input validation???

  // get date objects using input, convert to 24hr, set as dateObj
  let startDate = new Date();
  let endDate = new Date();
  let startTimeObj = setDateTime(startDate, start);
  let endTimeObj = setDateTime(endDate, end);

  // get time offset
  const diffInMilliseconds = Math.abs(endTimeObj - startTimeObj);
  const offset = diffInMilliseconds / staffNum;

  // call generateShifts
  let shifts = generateShifts(startTimeObj, endTimeObj, offset);

  // open modal window
  openModal();

  // call displayResults
  displayResults(start, end, staffNum, shifts);
}

// Generate shifts
function generateShifts(start, end, offset) {
  // consider using function calls or just adding comments

  let timesArray = [];
  let shiftTime = new Date(start.getTime());
  do {
    timesArray.push(shiftTime);
    shiftTime = new Date(shiftTime.getTime() + offset);
  } while (shiftTime <= end);

  let shiftArray = [];
  let shiftStart, shiftEnd, shiftLength;

  for (let i = 0; i < timesArray.length; i++) {
    shiftStart = timesArray[i];
    if (i === timesArray.length - 1) {
      break;
    } else {
      shiftEnd = timesArray[i + 1];
    }
    shiftStart = new Date(shiftStart.getTime() / 300000) * 300000;
    shiftEnd = new Date(shiftEnd.getTime() / 300000) * 300000;

    shiftLength = getShiftLength(shiftStart, shiftEnd);

    let shiftStartString = new Date(shiftStart)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace(/^0(?:0:0?)?/, "")
      .replace(/(:\d{2}| [AP]M)$/, "");
    let shiftEndString = new Date(shiftEnd)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace(/^0(?:0:0?)?/, "")
      .replace(/(:\d{2}| [AP]M)$/, "");

    console.log(shiftStartString);

    let shift = shiftStartString + " - " + shiftEndString;

    shiftArray.push([shift, shiftLength]);
    shiftStart = shiftEnd;
  }
  console.log(shiftArray);

  return shiftArray;
}

// function displayResults - copied from original for now
// important point: tables don't do well on phones...refer to responsive table bookmark
function displayResults(start, end, staffNum, shiftArray) {
  // generate results based on selected format
  var tableSelBig = document.getElementById("tableSelectBig").checked;
  var sheetSel = document.getElementById("sheetSelect").checked;
  var tableSel = document.getElementById("tableSelect").checked;

  // render print button for schedule
  if (tableSelBig) {
    if (start && end !== "") {
      document.getElementById("printButton").style.display = "block";
    }
  }

  // render print button for stats sheet
  if (sheetSel) {
    if (start && end !== "") {
      document.getElementById("printButton").style.display = "block";
    }
  }

  // render copy button if list/table selected
  if (tableSel) {
    if (start && end !== "") {
      document.getElementById("selectButton").style.display = "block";
      document.getElementById("printButton").style.display = "none";
      animateStandardTable.classList.add("animate");
    }
  }

  // table format with fillable staff column - large for office
  if (tableSelBig) {
    var tableBig = document.getElementById("officeSchedule");
    if (start && end !== "") {
      generateTableBigHeader(tableBig);
      generateTable1(tableBig, shiftArray);
      window.scrollTo({
        top: 657,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  // sheet format for statistics recording
  if (sheetSel) {
    var table2 = document.getElementById("statisticsForm");
    if (start && end !== "") {
      generateTable2(table2, shiftArray);
    }
    window.scrollTo({
      top: 657,
      left: 0,
      behavior: "smooth",
    });
  }

  // table format with fillable staff column
  if (tableSel) {
    var table = document.getElementById("standardTable");
    if (start && end !== "") {
      generateTableHead3(table);
      generateTable3(table, shiftArray);
      window.scrollTo({
        top: 657,
        left: 0,
        behavior: "smooth",
      });
    }
  }
}

// utilities-helper functions

// converts time to 24hr and sets as date obj
function setDateTime(date, time) {
  let PM = time.match("pm") ? true : false;

  time = time.split(":");
  let hour = time[0];
  let min = time[1];

  if (PM) {
    hour = 12 + parseInt(time[0], 10);
    min = time[1].replace("pm", "");
  } else {
    hour = time[0];
    min = time[1].replace("am", "");
  }

  date.setHours(hour);
  date.setMinutes(min);
  date.setSeconds("00");

  return date;
}

// get shift length
function getShiftLength(dateObjStart, dateObjEnd) {
  const length = new Date(dateObjEnd - dateObjStart);
  return length.getMinutes();
}

// generates table header for tableBig option
function generateTableBigHeader(table) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;

  var header1 =
    "<tr><th colspan=3 id=scheduleHeader>Overlook Schedule</th></tr>" +
    "<tr><th colspan=3><h1 id=scheduleDate>Date: " +
    today +
    "</h1></th></tr>" +
    "<tr><th id=scheduleTime>Time</th><th id=scheduleStaff>Staff</th></tr>";
  table.innerHTML = header1;
}

// generates table for tableBig option
function generateTable1(table, arrayData) {
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

// generates table for stats sheet option
function generateTable2(table, arrayData) {
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
      // Create a <td> element and a text node
      // make the text node the contents of the <td>
      // and put the <td> at the end of the table row
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

// generates table head for fillable staff option
function generateTableHead3(table) {
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

// generates table for fillable staff option
function generateTable3(table, arrayData) {
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

// selects table allowing it to be copied to clipboard
function selectElementContents(el) {
  var selection = document.getElementById("standardTableFormat");
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

// clears input
function clearAllInput() {
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
  document.getElementById("staffNum").value = "";
  document.getElementById("tableSelect").checked = false;
  document.getElementById("tableSelectBig").checked = true;
  document.getElementById("sheetSelect").checked = false;
}

// clears results
function clearAllResults() {
  document.getElementById("standardTable").innerHTML = "";
  document.getElementById("officeSchedule").innerHTML = "";
  document.getElementById("statisticsForm").innerHTML = "";
  document.getElementById("selectButton").style.display = "none";
  animateMainSchedule.classList.remove("animate");
  animateStandardTable.classList.remove("animate");
}

// resets all input and results
function clearAll() {
  clearAllInput();
  clearAllResults();
}

// Get DOM elements
const modal = document.querySelector("#my-modal");
//const modalBtn = document.querySelector("#modal-btn");
const closeBtn = document.querySelector(".close");
const printBtn = document.querySelector(".print");

// Events
//modalBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", outsideClick);
printBtn.addEventListener("click", printResults);

// function to open modal
function openModal() {
  modal.style.display = "block";
}
// function to close modal
function closeModal() {
  modal.style.display = "none";
}
// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

function printResults() {
  window.print();
}
