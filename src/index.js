// Importa o módulo 'fs' para lidar com operações de sistema de arquivos 
const fs = require('fs');
// Importa o módulo 'path' para lidar com caminhos de arquivos.
const path = require('path');

// Define a função mdLinks que recebe um caminho para um arquivo Markdown e opções adicionais.
function mdLinks(filePath, options) {
  // converte(resolve) o caminho relativo de um arquivo para caminho absoluto
  const absolutePath = path.resolve(filePath);
  // Lê o conteúdo do arquivo como uma string.
  return fs.promises.readFile(filePath, 'utf8').then((data) => {
    if (path.extname(absolutePath).toLowerCase() !== '.md') {
      throw new Error('Incompatible file: not a Markdown file');
    } else if (!data) {
      throw new Error('Unable to read the file because it is empty');
    }
    // Expressão regular para encontrar links no formato [text](url) no conteúdo do arquivo.
    const regex = /\[([^[\]]*?)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/gm;
    // Obtém todas as correspondências da expressão regular no conteúdo do arquivo.
    const captures = [...data.matchAll(regex)];
    // Mapeia as correspondências para um array de objetos contendo o texto,
    //a URL e o caminho do arquivo.
    const objLinks = captures.map((capture) => ({
      text: capture[1],
      url: capture[2],
      file: filePath,
    }));

    // Verifica se há pelo menos uma URL no arquivo.
    const hasUrl = objLinks.some(({url}) => (
      !!url
    ));

    if (!hasUrl) {
      throw Error('No links found in this file');
    // Se as opções incluem validação ou estatísticas, executa a validação dos links.
    } else if (options && (options.validate || options.stats)) {
      const validations = objLinks.map((link) =>
        validateLinks(link))
      // Se as opções incluem validação e não estatísticas, 
      // retorna um array de promessas de validação.
      if (options.validate && !options.stats) {
        return Promise.all(validations);
        // Se as opções incluem validação e estatísticas, 
        // retorna as estatísticas dos links validados.
      } else {
        return Promise.all(validations).then((validateArray) =>
          statsLinks(validateArray, options)
        );
      }
    }
    // Se não há opções de validação ou estatísticas, retorna o array de objetos de links.
    return objLinks;
  }).catch((error) => {
    if (error.code === 'ENOENT') {
      throw new Error('Invalid command');
    }
    throw error;
  });
}
// Função para validar um link usando fetch API.
function validateLinks(link) {
  return fetch(link.url)
    // Se a resposta é bem-sucedida (status 200),
    // marca o link como válido e armazena o status da resposta.
    .then((response) => {
      if (response.ok) {
        link.valid = true;
        link.status = response.status;
      } else {
      // Se a resposta não é bem-sucedida,
      // marca o link como inválido e armazena o status da resposta.
        link.valid = false;
        link.status = response.status;
      }
      // Retorna o objeto do link com o resultado da validação.
      return link;
    })
    // Se houver um erro ao fazer a solicitação, 
    // marca o link como inválido e armazena a mensagem de erro.
    .catch((error) => {
      link.valid = false;
      link.error = error.message;
      // Retorna o objeto do link com o resultado da validação.
      return link;
    });
}

// Função para calcular estatísticas dos links,
// incluindo o número total de links, links únicos e links quebrados.
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

module.exports = { mdLinks, validateLinks, statsLinks };