const fs = require('fs');

function extractLinks(filePath, options) {
  return fs.promises.readFile(filePath, 'utf8').then((data) => {
    const regex = /\[([^[\]]*?)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/gm;
    const captures = [...data.matchAll(regex)];
    const objLinks = captures.map((capture) => ({
      text: capture[1],
      url: capture[2],
      file: filePath,
    }));

    if (options.validate || options.stats) {
      const validations = objLinks.map((link) =>
        validateLinks(link)
      )
      if (options.validate && !options.stats) {
        return Promise.all(validations);
      } if (options.stats) {
        return Promise.all(validations).then((validateArray) =>
          statsLinks(validateArray, options)
        );
      }
    }
    return objLinks;
  });
}

function validateLinks(link) {
  return fetch(link.url)
    .then((response) => {
      if (response.ok) {
        link.valid = true;
        link.status = response.status;
      } else {
        link.valid = false;
        link.status = response.status;
      }
      return link;
    })
    .catch((error) => {
      link.valid = false;
      link.error = error.message;
      return link;
    });
}

function statsLinks(links) {
  const linksSize = links.length;
  const uniqueLinks = [...new Set(links.map((link) => link.url))].length;
  const brokenLinks = links.filter((link) => link.status !== 200).length;

  return {
    total: linksSize,
    unique: uniqueLinks,
    broken: brokenLinks,
  };
}

module.exports = { extractLinks, validateLinks, statsLinks };
