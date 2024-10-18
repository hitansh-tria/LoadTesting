const fs = require('fs');
const path = require('path');

// Define the input and output file paths
const inputFilePath = path.join(__dirname, 'emails.txt');  // Text file with the emails
const outputFilePath = path.join(__dirname, 'emails.csv');  // Output CSV file

// Read the email list from the input text file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the input file:', err);
    return;
  }

  // Split the file content by newlines to get each email
  const emails = data.split('\n').filter(Boolean);  // Filter removes any empty lines

  // Convert the email array to CSV format with a header
  const csvContent = 'email\n' + emails.join('\n');

  // Write the CSV content to the output file
  fs.writeFile(outputFilePath, csvContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing the CSV file:', err);
    } else {
      console.log('CSV file has been saved:', outputFilePath);
    }
  });
});
