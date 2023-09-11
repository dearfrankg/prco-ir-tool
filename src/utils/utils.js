/* eslint-disable no-console */
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const sortStringsNumerically = (a, b) => {
  return a.localeCompare(b);
};

export const isUnique = (arr) => {
  const unique = new Set(arr);
  return unique.size === arr.length;
};

export const hasExistingPath = (path) => {
  return fs.existsSync(path);
};

export const hasExistingFolder = (folderPath) => {
  const stats = fs.statSync(folderPath);
  return stats.isDirectory();
};

export const createFolder = (folderPath) => {
  const isFilePath = hasExistingPath(folderPath) && !hasExistingFolder(folderPath);
  const isFolderPath = hasExistingPath(folderPath) && hasExistingFolder(folderPath);

  if (isFilePath) {
    throw new Error('Cannot create folder because file exists with the same name');
  }

  if (!isFolderPath) {
    fs.mkdirSync(path);
  }
};

export const downloadFile = (reportUrl, reportPath) => {
  return axios({
    method: 'get',
    url: reportUrl,
    responseType: 'stream',
  })
    .then((response) => {
      response.data.pipe(fs.createWriteStream(reportPath));
    })
    .catch((e) => {
      console.log('error', e);
    });
};
