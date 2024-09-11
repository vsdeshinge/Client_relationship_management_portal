// utils.js
function deepMerge(target, source) {
  for (let key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          deepMerge(target[key], source[key]);
      } else if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
          target[key] = source[key];
      }
  }
  return target;
}

module.exports = deepMerge; // Export the function
