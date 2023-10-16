const fs = require('fs');

function extractLinks(filePath, options) {
  return fs.promises.readFile(filePath, 'utf8').then((data) => {
    const regex = /\[([^[\]]*?)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/gm;
    const captures = [...data.matchAll(regex)];
    const links = captures.map((capture) => ({
      text: capture[1],
      url: capture[2],
      file: filePath,
    }));

    if (options.validate) {
      const validations = links.map((link) =>
        validateLinks(link));
      return Promise.all(validations);
    }
    return links;
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

module.exports = { extractLinks, validateLinks };

