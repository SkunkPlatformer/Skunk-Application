// utils.js
const moment = require('moment');

function parseDuration(durationString) {
  try {
    const duration = moment.duration(durationString);
    const milliseconds = duration.asMilliseconds();
    return milliseconds > 0 ? milliseconds : null; // Handle negative or zero durations
  } catch (error) {
    console.error('Error parsing duration:', error);
    return null;
  }
}

module.exports = { parseDuration }; // Export the function
