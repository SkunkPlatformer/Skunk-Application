const { exec } = require("child_process");

async function pastebinAPI() {
  console.log("https://pastebin.com");
}

async function node() {
  console.log("Coming Soon.");
}

async function executeBot(filePath) {
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

module.exports = { pastebinAPI, node, executeBot };
