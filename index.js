const inquirer = require("inquirer");
const fs = require("fs").promises;
const path = require("path");

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

async function walk(dir, structure = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const content = await walk(path.join(dir, file.name), []);
      const substructure = { name: file.name, content };
      structure.push(substructure);
    } else {
      const substructure = { name: file.name };
      structure.push(substructure);
      path.join(dir, file.name);
    }
  }
  return structure;
}

async function generate(readPath, writePath = ".") {
  console.debug(1);
  const files = await fs.readdir(path.join(__dirname, readPath));
  console.debug(2);

  files.map(async function (file) {
    const relativeFilePath = path.join(readPath, file);
    const absoluteFilePath = path.join(__dirname, relativeFilePath)
    console.debug(3);

    const stat = await fs.stat(absoluteFilePath);
    console.debug(4);

    if (stat.isFile()) {
      const writeFilePath = path.join(writePath, file);

      fs.cp(absoluteFilePath, writeFilePath);
      // const content = await fs.open(relativeFilePath, "utf8");

      // await fs.writeFile(writeFilePath, content, "utf8");
    }
  });
}

// async function main() {
//   console.log(await walk(TEMPLATE));
// }

// main();
generate(TEMPLATE);
