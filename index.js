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
    findEmployeesWithShorterShifts();
    findEmployeesWithLongShifts();
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

 function findEmployeesWithShorterShifts() {


    let employeesWithShorterShifts = [];
    let fileNo = employees[0].FileNumber;

    for(let i=0; i<employees.length - 1; i++){
      let shiftA = employees[i];
      let shiftB = employees[i+1];

      if(shiftA.FileNumber !== shiftB.FileNumber) {
        continue;
      }

      const timeStr1 = shiftA.TimeOut.substring(11);
      const timeStr2 = shiftB.TimeIn.substring(11)

      let timeBetweenShifts = calculateTimeDifference(timeStr1, timeStr2);
  
      if(timeBetweenShifts > 1 && timeBetweenShifts < 10) {
        const pid = employees[i].PositionId;
        const name = employees[i].EmployeeName;

        employeesWithShorterShifts.push({
          pid,
          name
        });

        let currentFileNo = employees[i].FileNumber;
        while(currentFileNo == employees[i].FileNumber){
          i++;
        }
      }
    }
    console.log(employeesWithShorterShifts);
 }


 function calculateTimeDifference(timeStr1, timeStr2) {
  // Parse the time strings into Date objects for comparison
  const time1 = new Date(`01/01/2023 ${timeStr1}`);
  const time2 = new Date(`01/01/2023 ${timeStr2}`);

  // Calculate the time difference in milliseconds
  const timeDifferenceMilliseconds = Math.abs(time1 - time2);

  // Convert the time difference to hours
  const timeDifferenceHours = timeDifferenceMilliseconds / (60 * 60 * 1000);

  return timeDifferenceHours;
}

function findEmployeesWithLongShifts() {
  let employeesWithLongShifts = [];
  let fileNo = employees[0].FileNumber;

  for(let i=0; i<employees.length; i++) {
   

    if(fileNo !== employees[i].FileNumber){
      continue;
    }
    const [hours, minutes] = employees[i].TimeCard.split(':').map(Number);
    const totalHours = hours + minutes/60;
    
    if(totalHours > 14) {
      const pid =  employees[i].PositionId;
      const name = employees[i].EmployeeName
      employeesWithLongShifts.push({
        pid,
        name
      })
    }

    let currentFileNo = employees[i].FileNumber;
    while(currentFileNo == employees[i].FileNumber){
      i++;
    }
    
  }
  console.log(employeesWithLongShifts);
}

 


