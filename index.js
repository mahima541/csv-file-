// import express from "express";
const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const fast_csv = require('fast-csv');
const  csvParser = require('csv-parser');
const multer = require('multer');
// const moment = require('moment');




// // import mysql from "mysql"; // Import mysql2 instead of mysql
// import csvParser from "csv-parser";
// import multer from "multer";

const app = express();

// Create a Multer instance to handle file uploads
const upload = multer({ dest: "./public/temp" }); // Destination folder for uploaded files

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "info",
  // insecureAuth: true,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.log("Error connecting to db: " + err.message);
    return;
  }
  console.log("Connected to the MySQL database");
});

// Define the route handler for file upload
app.post("/upload", upload.single("csvFile"), (req, res) => {
  // Read the uploaded CSV file and insert data into the database

  fs.createReadStream(req.file?.path)
    .pipe(csvParser())
    .on("data", (row) => {
      connection.query(
        "INSERT INTO emp SET ?",
        row,
        (error, results, fields) => {
          if (error) throw error;
          console.log("Inserted a row into the MySQL database");
        }
      );
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
      // Close the database connection after processing the CSV file
      connection.end();
    });

  res.send("File uploaded and data inserted into the database.");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
})

///--------------------tranfer data one table to another----------------------------//

app.get('/transfer', (req, res) => {
  // Query the source table to get all data
  connection.query('SELECT * FROM employee', (error, results) => {
      if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
          return;
      }

      // Loop through each row of data from the source table
      results.forEach(row => {
          // Check if the ID already exists in the destination table
          connection.query('SELECT * FROM user_1 WHERE id = ?', [row.id], (error, destResults) => {
              if (error) {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                  return;
              }

              if (destResults.length > 0) {
                  // If the ID exists, insert the data into the third table
                  connection.query('INSERT INTO user_2 SET ?', row, (error, thirdResults) => {
                      if (error) {
                          console.error(error);
                          res.status(500).send('Internal Server Error');
                          return;
                      }
                      console.log('Data transferred to third table');
                  });
              } else {
                  // If the ID does not exist, insert the data into the destination table
                  connection.query('INSERT INTO user_1 SET ?', row, (error, destResults) => {
                      if (error) {
                          console.error(error);
                          res.status(500).send('Internal Server Error');
                          return;
                      }
                      console.log('Data transferred to destination table');
                  });
              }
          });
      });

      res.send('Data transferred successfully');
  });
});

////-----------------based on the monthly salary transfer data from one table to another-----------//

//--------------------on basis og current month ---------------///

// Define a route to handle data transfer
app.get('/transferSalary', (req, res) => {
    // Get the current month and year
    const currentMonth = moment().format('MM');
    const currentYear = moment().format('YYYY');

    // Query the source table to get data for the current month
    connection.query('SELECT * FROM employee_3 WHERE MONTH(salary_date) = ? AND YEAR(salary_date) = ?', [currentMonth, currentYear], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
            return;
        }
        // console.log(results);

        // Loop through each row of data from the source table
        results.forEach(row => {
            // Check if the employee's salary for the current month has already been credited
            connection.query('SELECT * FROM employee_3_2 WHERE employee_id = ? AND MONTH(salary_date) = ? AND YEAR(salary_date) = ?', [row.employee_id, currentMonth, currentYear], (error, destResults) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                console.log(connection.query);

                if (destResults.length === 0) {
                    // If the salary has not been credited, insert the data into the destination table
                    connection.query('INSERT INTO employee_3_2 SET ?', row, (error, destInsertResults) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        console.log('Data transferred to destination table');
                    });
                } else {
                    console.log(`Salary already credited for employee ${row.employee_id} for the current month`);
                }
            });
        });

        res.send('Data transferred successfully');
    });
});

///---------------------second method----------------------///

app.get('/transferMonth', (req, res) => {
  // Get the current month
  // const currentMonth = moment().month() + 1; // Add 1 to get month number starting from 1 (January)
  const currentDate = new Date();
    // Get the current month (1-12)
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns zero-based index

  // Query the source table to get data for the current month
  connection.query('SELECT * FROM employees_2 WHERE month = ?', [currentMonth], (error, results) => {
      if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
          return;
      }

      // Loop through each row of data from the source table
      results.forEach(row => {
          // Check if the employee's salary for the current month has already been credited
          connection.query('SELECT * FROM sub_employees_1 WHERE id = ? AND month = ?', [row.id, currentMonth], (error, destResults) => {
              if (error) {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                  return;
              }

              if (destResults.length === 0) {
                  // If the salary has not been credited, insert the data into the destination table
                  connection.query('INSERT INTO sub_employees_2 SET ?', row, (error, destInsertResults) => {
                      if (error) {
                          console.error(error);
                          res.status(500).send('Internal Server Error');
                          return;
                      }
                      console.log('Data transferred to destination table');
                  });
              } else {
                  console.log(`Salary already credited for employee ${row.id} for the current month`);
              }
          });
      });

      res.send('Data transferred successfully');
  });
});


///-------------------------third method ----------------------///

app.get('/transferThird', (req, res) => {
  // Query the source table to get all data
  connection.query('SELECT * FROM employees_2', (error, results) => {
      if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
          return;
      }

      // Loop through each row of data from the source table
      results.forEach(row => {
          // Check if the ID already exists in the second table for the same month
          connection.query('SELECT * FROM sub_employees_1 WHERE id = ? AND month = ?', [row.id, row.month], (error, destResults) => {
              if (error) {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                  return;
              }

              if (destResults.length === 0) {
                  // If the ID does not exist for the same month, insert the data into the second table
                  connection.query('INSERT INTO sub_employees_1 SET ?', row, (error, thirdResults) => {
                      if (error) {
                          console.error(error);
                          res.status(500).send('Internal Server Error');
                          return;
                      }
                      console.log('Data transferred to second table');
                  });
              } else {
                  // If the ID exists for the same month, do not transfer the data to the second table
                  console.log(`Data for ID ${row.id} already exists in second table for month ${row.month}`);
              }
          });
      });

      res.send('Data transferred successfully');
  });
});

////--------------------------salary average data-----------------------//
app.get('/avgsalary', (req, res) => {
    // Query to retrieve data from the original Employee table
    const selectQuery = 'SELECT * FROM emp_salary';

    // Execute the select query
    connection.query(selectQuery, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Iterate through each employee data
        results.forEach(employee => {
            const { id, name, salary, months_received_salary } = employee;

            // Check if the employee's id exists in the second table
            const selectQuerySecondTable = `SELECT * FROM emp_salary_1 WHERE id = ${id}`;
            connection.query(selectQuerySecondTable, (err, results) => {
                if (err) {
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                // Check if the employee exists in the second table
                if (results.length > 0) {
                    // Transfer the employee's data to the third table
                    const insertQueryThirdTable = `INSERT INTO emp_salary_2 (id, name, salary, months_received_salary) VALUES (${id}, '${name}', ${salary}, ${months_received_salary})`;
                    connection.query(insertQueryThirdTable, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                } else {
                    // Transfer the employee's data to the second table
                    const insertQuerySecondTable = `INSERT INTO emp_salary_1 (id, name, salary, months_received_salary) VALUES (${id}, '${name}', ${salary}, ${months_received_salary})`;
                    connection.query(insertQuerySecondTable, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                }
            });
        });

        // Query to calculate the average salary for every employee in the second and third tables
        const averageQuery = `SELECT id, AVG(salary) AS average_salary FROM (SELECT * FROM emp_salary_1 UNION ALL SELECT * FROM emp_salary_2) AS temp GROUP BY id`;

    //     const averageQuery = `
    //     SELECT e.name, AVG(s.salary) AS average_salary
    //     FROM emp_salary e
    //     LEFT JOIN (
    //         SELECT id, salary FROM emp_salary_1
    //         UNION ALL
    //         SELECT id, salary FROM emp_salary_2
    //     ) s ON e.id = s.id
    //     GROUP BY e.id
    // `;
        // Execute the average query
        connection.query(averageQuery, (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            // Display the average salary for each employee
            const averageSalaries = results.map(row => ({
                id: row.id,
                average_salary: row.average_salary
            }));
            console.log(averageSalaries);

            // Insert the average salaries into a new table
            const insertQuery = 'INSERT INTO avgsalary (id, average_salary) VALUES ?';
            const values = averageSalaries.map(salary => [salary.id, salary.average_salary]);

            connection.query(insertQuery, [values], (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                // Send response with average salaries
                res.json({ averageSalaries });
            });
        });
    });
});

///-------------------select name , id and average salary by join --------------///
app.get('/employeeSalary', (req, res) => {
    const query = `
        SELECT avgsalary.id, emp_salary_1.name, avgsalary.average_salary
        FROM emp_salary_1
        JOIN avgsalary ON emp_salary_1.id = avgsalary.id
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json({ employeeSalaries: results });
    });
});