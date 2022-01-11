#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const TEMPLATE = path.normalize("templates/express-typescript-starter");

const QUESTIONS = [
  {
    name: "projectName",
    type: "input",
    message: "Project name:",
    validate: function (input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    },
  },
];

async function generate(readPath, writePath) {
  const files = await fs.readdir(path.join(__dirname, readPath));
  await fs.mkdir(writePath);


  Promise.all(
    files.map(async function (file) {
      const relativeFilePath = path.join(readPath, file);
      const absoluteFilePath = path.join(__dirname, relativeFilePath);

      const stat = await fs.stat(absoluteFilePath);
      const newWritePath = path.join(writePath, file);

      if (stat.isFile()) {
        return fs.cp(absoluteFilePath, newWritePath);
      }
      if (stat.isDirectory()) {
        const newReadPath = path.join(readPath, file);
        return generate(newReadPath, newWritePath);
      }
    })
  );
}

async function main() {
  const { projectName } = await inquirer.prompt(QUESTIONS);

  console.info("Generating project structure...");
  await generate(TEMPLATE, projectName);

  console.info("Initializing git repository...");
  await promisify(exec)(`cd ${projectName} && git init`);

  console.info("Installing dependencies...");
  await promisify(exec)(`cd ${projectName} && npm i`);

  console.info("Creating initial commit...");
  exec(`cd ${projectName} && git add . && git commit -m "Initial commit"`);

  console.info();
  console.info("Your project has been successfully generated! 🚀");
  console.info(`\tExecute: cd ${projectName}`);
  console.info("\t\tand start coding!!!");
}

main();
