const { wisTemplates } = require('./wis');
const { oneguardTemplates } = require('./oneguard');
const { verityTemplates } = require('./verity');

const templates = {
  wis: wisTemplates,
  oneguard: oneguardTemplates,
  verity: verityTemplates,
};

module.exports = {
  templates,
};
