const normalizeName = (string) => string.replace(/ /g, '_');
const toBlankSpace = (string) => string.replace(/_/g, ' ');

module.exports = {
    normalizeName,
    toBlankSpace
}