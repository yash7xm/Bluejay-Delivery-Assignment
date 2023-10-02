const fs = require('fs');
const csv = require('csv-parser');

const DATA_FILE = 'data.csv';
const employees = [];

// Function to process each CSV row and store employee data
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

// Read and process the CSV file
fs.createReadStream(DATA_FILE)
  .pipe(csv())
  .on('data', processCSVRow)
  .on('end', () => {
    findEmployeesWithConsecutiveDays();
    findEmployeesWithShorterShifts();
    findEmployeesWithLongShifts();
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });

// Function to find employees who have worked for 7 consecutive days
function findEmployeesWithConsecutiveDays() {
  let nextDate = null;
  let currDate = null;
  let fileNo = employees[0].FileNumber;
  let consecutiveDays = 1;
  let employeesWorkedForSevenConsecutiveDays = [];
  
  for (let employee of employees) {
    if (fileNo != employee.FileNumber) {
      fileNo = employee.FileNumber;
      nextDate = null;
      currDate = null;
      consecutiveDays = 1;
      continue;
    }

    currDate = new Date(employee.TimeIn.substring(0, 10));
  
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

      const pid = employee.PositionId;
      const name = employee.EmployeeName;
      employeesWorkedForSevenConsecutiveDays.push({
        pid,
        name
      });
    }
  }
  console.log('Employees who worked for 7 consecutive days:', employeesWorkedForSevenConsecutiveDays);
}

// Function to find employees with shifts less than 10 hours between but greater than 1 hour
function findEmployeesWithShorterShifts() {
  let employeesWithShorterShifts = [];
  let fileNo = employees[0].FileNumber;

  for (let i = 0; i < employees.length - 1; i++) {
    let shiftA = employees[i];
    let shiftB = employees[i + 1];

    if (shiftA.FileNumber !== shiftB.FileNumber) {
      continue;
    }

    const timeStr1 = shiftA.TimeOut.substring(11);
    const timeStr2 = shiftB.TimeIn.substring(11);
    let timeBetweenShifts = calculateTimeDifference(timeStr1, timeStr2);

    if (timeBetweenShifts > 1 && timeBetweenShifts < 10) {
      const pid = shiftA.PositionId;
      const name = shiftA.EmployeeName;
      employeesWithShorterShifts.push({
        pid,
        name
      });

      // Skip to the next employee with a different file number
      let currentFileNo = shiftA.FileNumber;
      while (currentFileNo == employees[i].FileNumber) {
        i++;
      }
    }
  }
  console.log('Employees with shorter shifts (1-10 hours between):', employeesWithShorterShifts);
}

// Function to calculate the time difference between two time strings
function calculateTimeDifference(timeStr1, timeStr2) {
  const time1 = new Date(`01/01/2023 ${timeStr1}`);
  const time2 = new Date(`01/01/2023 ${timeStr2}`);
  const timeDifferenceMilliseconds = Math.abs(time1 - time2);
  const timeDifferenceHours = timeDifferenceMilliseconds / (60 * 60 * 1000);
  return timeDifferenceHours;
}

// Function to find employees who have worked for more than 14 hours in a single shift
function findEmployeesWithLongShifts() {
  let employeesWithLongShifts = [];
  let fileNo = employees[0].FileNumber;

  for (let i = 0; i < employees.length; i++) {
    if (fileNo !== employees[i].FileNumber) {
      continue;
    }

    const [hours, minutes] = employees[i].TimeCard.split(':').map(Number);
    const totalHours = hours + minutes / 60;

    if (totalHours > 14) {
      const pid = employees[i].PositionId;
      const name = employees[i].EmployeeName;
      employeesWithLongShifts.push({
        pid,
        name
      });
    }

    // Skip to the next employee with a different file number
    let currentFileNo = employees[i].FileNumber;
    while (currentFileNo == employees[i].FileNumber) {
      i++;
    }
  }
  console.log('Employees with long shifts (more than 14 hours):', employeesWithLongShifts);
}
