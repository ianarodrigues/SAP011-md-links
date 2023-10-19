#!/usr/bin/env  node
// console.log(chalk.red('Hello world!'));

const chalk = require('chalk');
const { extractLinks } = require('./index');

const filePath = process.argv[2];
const options = {
  validate: process.argv.includes('--validate'),
  stats: process.argv.includes('--stats'),
};

extractLinks(filePath, options)
  .then((objLinks) => {
    if (options.validate && !options.stats) {
      objLinks.forEach((link) => {
        if (link.status === 200) {
          console.log(
            chalk.bgGreen(`☑ OK ${link.status}`),
            chalk.black('| ') + chalk.magenta(link.text),
            chalk.white(link.file),
            chalk.green(link.url),
          );
        } else {
          console.log(
            chalk.bgRed(`☒ FAIL ${link.status}`),
            chalk.black('| ') + chalk.magenta(link.text),
            chalk.white(link.file),
            chalk.red(link.url),
          );
        }
        console.log(
          chalk.black('---------------------------------------------------------------------------------------------------------------------------------------')
        );
      });
    } else if (options.stats && !options.validate) {
      console.log(chalk.cyan(`Total: ${objLinks.total}`));
      console.log(chalk.yellow(`Unique: ${objLinks.unique}`));
    } else if (options.stats && options.validate) {
      console.log(chalk.cyan(`Total: ${objLinks.total}`));
      console.log(chalk.yellow(`Unique: ${objLinks.unique}`));
      console.log(chalk.red(`Broken: ${chalk.red(objLinks.broken)}`));
    } else {
      objLinks.forEach((link) => {
        console.log(chalk.white('Title: ') + chalk.cyan(link.text));
        console.log(chalk.white('URL: ') + chalk.magenta(link.url));
        console.log(chalk.white('File: ') + chalk.yellow(link.file));
        console.log(
          chalk.black('-------------------------------------------------------------------------------------------------------')
        );
      });
    }
  })
 
