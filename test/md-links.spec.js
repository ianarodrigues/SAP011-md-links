// const { expect, describe, it, jest } = require('@jest/globals');
const { mdLinks, validateLinks, statsLinks } = require('../src/index');

describe('mdLinks', () => {
  it('should extract all links from a Markdown file', () => {
    const filePath = './files/file-with-links.md';
    const expectedLinks = [
      {
        text: 'Markdown',
        url: 'https://pt.wikipedia.org/wiki/Markdown',
        file: filePath,
      },
      {
        text: 'Markdown',
        url: 'https://pt.wikipedia.org/wiki/Markdown',
        file: filePath,
      },
      {
        text: 'Node.js',
        url: 'https://nodejs.org/',
        file: filePath,
      },
      {
        text: 'GitHub',
        url: 'https://github.com/ianarodrigue',
        file: filePath,
      },
    ];
    return mdLinks(filePath).then((result) => {
      expect(result).toEqual(expectedLinks);
    });
  });

  it('should throw an error if the file is empty', () => {
    const path = './files/empty-file.md';
    return expect(mdLinks(path)).rejects.toThrow(
      'Unable to read the file because it is empty'
    );
  });

  it('should throw error if file is not .md', () => {
    const path = './files/text.txt';
    return expect(mdLinks(path)).rejects.toThrow(
      'Incompatible file: not a Markdown file'
    );
  });
  it('should throw an error if there are no links in the file', () => {
    const path = './files/file-without-link.md';
    return expect(mdLinks(path)).rejects.toThrow('No links found in this file');
  });

  it('should return all link validations if the validation option is enabled', () => {
    const filePath = './files/file-with-links.md';
    const options = { validate: true, stats: false };
    return mdLinks(filePath, options).then((result) => {
      expect(result).toStrictEqual([
        {
          file: './files/file-with-links.md',
          status: 200,
          text: 'Markdown',
          url: 'https://pt.wikipedia.org/wiki/Markdown',
          valid: true,
        },
        {
          file: './files/file-with-links.md',
          status: 200,
          text: 'Markdown',
          url: 'https://pt.wikipedia.org/wiki/Markdown',
          valid: true,
        },
        {
          file: './files/file-with-links.md',
          status: 200,
          text: 'Node.js',
          url: 'https://nodejs.org/',
          valid: true,
        },
        {
          file: './files/file-with-links.md',
          status: 404,
          text: 'GitHub',
          url: 'https://github.com/ianarodrigue',
          valid: false,
        },
      ]);
    });
  });
  it('should return link statistics if the statistics option is enabled', () => {
    const filePath = './files/file-with-links.md';
    const options = { validate: true, stats: true };
    return mdLinks(filePath, options).then((result) => {
      expect(result).toStrictEqual({ broken: 1, total: 4, unique: 3 });
    });
  });
  it('should return link statistics if the statistics option is enabled', () => {
    const filePath = './files/file-with-links.md';
    const options = { validate: false, stats: true };
    return mdLinks(filePath, options).then((result) => {
      expect(result).toStrictEqual({ broken: 1, total: 4, unique: 3 });
    });
  });
});

describe('validateLinks', () => {
  it('should return status 200 when the link is valid', () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 200,
    }));

    const link = {
      url: 'https://github.com/ianarodrigues',
    };
    const result = validateLinks(link);
    expect(result).resolves.toEqual({ ...link, valid: true, status: 200 });
  });

  it('should return 404 status when the link is not valid', () => {
    const link = {
      text: 'GitHub',
      url: 'https://github.com/ianarodrigue',
      file: './files/file-with-links.md',
    };
    const expectedInvalidLink = {
      text: 'GitHub',
      url: 'https://github.com/ianarodrigue',
      file: './files/file-with-links.md',
      valid: false,
      error: '404',
    };

    global.fetch = jest.fn(() => Promise.reject(new Error('404')));

    return validateLinks(link).then((result) => {
      expect(result).toEqual(expectedInvalidLink);
    });
  });
});

describe('statsLinks', () => {
  it('should report statistics from an array of links', () => {
    const filePath = './files/file-with-links.md';
    const expectedLinks = [
      {
        text: 'Markdown',
        url: 'https://pt.wikipedia.org/wiki/Markdown',
        file: filePath,
        status: 200,
      },
      {
        text: 'Markdown',
        url: 'https://pt.wikipedia.org/wiki/Markdown',
        file: filePath,
        status: 200,
      },
      {
        text: 'Node.js',
        url: 'https://nodejs.org/',
        file: filePath,
        status: 200,
      },
      {
        text: 'GitHub',
        url: 'https://github.com/ianarodrigue',
        file: filePath,
        status: 404,
      },
    ];
    const result = statsLinks(expectedLinks);

    expect(result).toHaveProperty('total', 4);
    expect(result).toHaveProperty('unique', 3);
    expect(result).toHaveProperty('broken', 1);
  });
});
