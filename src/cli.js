#!/usr/bin/env  node
// const chalk = require('chalk');
// console.log(chalk.red('Hello world!'));

const { extractLinks } = require('./index');

const filePath = process.argv[2];
// console.log('Caminho do arquivo:', filePath);
const options = {
  validate: process.argv.includes('--validate'),
  status: process.argv.includes('--status'),
};

extractLinks(filePath, options).then((links) => {
  console.log(links);
});

