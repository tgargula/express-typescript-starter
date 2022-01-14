#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execute = promisify(exec);

const copyFile = async (source, destination) => {
  const content = await fs.readFile(source, 'utf8');
  await fs.writeFile(destination, content, 'utf8');
}

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
  {
    name: "initializeGit",
    type: "list",
    message: "Do you want to initialize git? (git required)",
    choices: ["Yes", "No"],
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
        return copyFile(absoluteFilePath, newWritePath);
      }
      if (stat.isDirectory()) {
        const newReadPath = path.join(readPath, file);
        return generate(newReadPath, newWritePath);
      }
    })
  );
}

async function main() {
  const { projectName, initializeGit } = await inquirer.prompt(QUESTIONS);

  console.info("Generating project structure...");
  await generate(TEMPLATE, projectName);

  console.info("Copying .env...");
  await copyFile(
    path.join(__dirname, TEMPLATE, ".env.sample"),
    path.join('.', projectName, ".env")
  );

  if (initializeGit === "Yes") {
    console.info("Initializing git repository...");
    await execute(`cd ${projectName} && git init`);
    console.info("Creating .gitignore...");
    await fs.writeFile(path.join(projectName, ".gitignore"), [
      "**/node_modules/\n",
      "**/dist/\n",
      ".env\n",
    ], { flag: 'a+' });
  }

  console.info("Installing dependencies...");
  await execute(`cd ${projectName} && npm i`);

  if (initializeGit === "Yes") {
    console.info("Creating initial commit...");
    await execute(`cd ${projectName} && git add . && git commit -m "Initial commit"`);
  }

  console.info();
  console.info("Your project has been successfully generated! 🚀");
  console.info();
  console.info(`\tExecute: cd ${projectName}`);
  console.info();
  console.info("and start coding!!!");
}

main();
