/* eslint-disable no-console */
const axios = require('axios');
const fs = require('fs');

const sortStringsNumerically = (a, b) => {
  return a.localeCompare(b);
};

const isUnique = (arr) => {
  const unique = new Set(arr);
  return unique.size === arr.length;
};

const hasExistingPath = (path) => {
  return fs.existsSync(path);
};

const hasExistingFolder = (folderPath) => {
  const stats = fs.statSync(folderPath);
  return stats.isDirectory();
};

const createFolder = (folderPath) => {
  const isFilePath = hasExistingPath(folderPath) && !hasExistingFolder(folderPath);
  const isFolderPath = hasExistingPath(folderPath) && hasExistingFolder(folderPath);

  if (isFilePath) {
    throw new Error('Cannot create folder because file exists with the same name');
  }

  if (!isFolderPath) {
    fs.mkdirSync(folderPath);
  }
};

const downloadFile = (reportUrl, reportPath) => {
  return axios({
    method: 'get',
    url: reportUrl,
    responseType: 'stream',
  })
    .then((response) => {
      response.data.pipe(fs.createWriteStream(reportPath));
      return true;
    })
    .catch(() => {
      return false;
    });
};

module.exports = {
  sortStringsNumerically,
  isUnique,
  hasExistingPath,
  hasExistingFolder,
  createFolder,
  downloadFile,
};
