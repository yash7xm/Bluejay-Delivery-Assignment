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
    PayCycleStartDate,
    PayCycleEndDate,
    EmployeeName,
    FileNumber,
  });
}

fs.createReadStream(DATA_FILE)
  .pipe(csv())
  .on('data', processCSVRow)
  .on('end', () => {
    findEmployeesWithConsecutiveDays();
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });

 function findEmployeesWithConsecutiveDays() {
  let nextDate = null;
  let currDate = null;
  let fileNo = employees[0].FileNumber;
  let consecutiveDays = 1;
  let employeesWorkedForSevenConsecutiveDays = [];
  
  for (let employee of employees) {

    if(fileNo != employee.FileNumber){
      fileNo = employee.FileNumber;
      nextDate = null;
      currDate = null;
      consecutiveDays = 1;
      continue;
    }

    currDate = employee.TimeIn.substring(0, 10);
    currDate = new Date(currDate);
  
    if (nextDate === null) {
      nextDate = new Date(currDate);
      nextDate.setDate(currDate.getDate() + 1);
      consecutiveDays = 1;
    } else {
      if (currDate.getDate() === nextDate.getDate()) {
        nextDate.setDate(currDate.getDate() + 1);
        consecutiveDays++;
      } else {
        nextDate = null;
        consecutiveDays = 1;
      }
    }
    
    if (consecutiveDays === 7) {
      nextDate = null;
      consecutiveDays = 1;

      const pid =  employee.PositionId;
      const name = employee.EmployeeName
      employeesWorkedForSevenConsecutiveDays.push({
        pid,
        name
      })
    }
  }
  console.log(employeesWorkedForSevenConsecutiveDays);
 }

 


