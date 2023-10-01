const fs = require('fs');
const csv = require('csv-parser');

const DATA_FILE = 'data.csv';
const employees = [];


function processCSVRow(row) {

    const PositionId = row['Position ID'];
    const PositionStatus = row['Position Status'];
    const TimeIn = row['Time'];
    const TimeOut = row['Time Out'];
    const TimeCard = row['Timecard Hours (as Time)'];
    const PayCycleStartDate = row['Pay Cycle Start Date'];
    const PayCycleEndDate = row['Pay Cycle End Date'];
    const EmployeeName = row['Employee Name'];
    const FileNumber = row['File Number'];

  // Store data in an array of employees
  employees.push({
    PositionId,
    PositionStatus,
    TimeIn,
    TimeOut,
    TimeCard,
    PayCycleEndDate,
    EmployeeName,
    FileNumber,
  });
}

fs.createReadStream(DATA_FILE)
  .pipe(csv())
  .on('data', processCSVRow)
  .on('end', () => {
    showData();
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });

 function showData() {
    console.log(employees[1]);
 }


