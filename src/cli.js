#!/usr/bin/env  node
// const chalk = require('chalk');
// console.log(chalk.red('Hello world!'));

const { extractLinks } = require("./index");

const filePath = process.argv[2];
// console.log('Caminho do arquivo:', filePath);
const options = {
  validate: process.argv.includes("--validate"),
  stats: process.argv.includes("--stats"),
};

extractLinks(filePath, options).then((links) => {
  console.log(links);
});
