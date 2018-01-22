'use strict';

const fs = require('fs');
const path = require('path');
const request = require('sync-request');

const REQUEST_CACHE_DIR = '/tmp/paws'; // process.cwd() + '/tmp';

// init cache dir
try {
  fs.mkdirSync(REQUEST_CACHE_DIR);
} catch (e) { }

module.exports = {
  getJSON(url) {
    const fn = path.join(REQUEST_CACHE_DIR,
      url.replace(/[/\\]+/g, '_')
    );

    const loadLocalFile = () => require(fn.startsWith(path.sep) ? fn : '.' + path.sep + fn);
    const writeLocalFile = data => fs.writeFileSync(fn, JSON.stringify(data, null, 2));
    try {
      const s = fs.statSync(fn);
      if ((new Date() - s.mtime) < 1000 * 60 * 60) { // 1h
        return loadLocalFile();
      }
      const resh = request('HEAD', 'https://pricing.us-east-1.amazonaws.com' + url);
      if (s.mtime > new Date(resh.headers['last-modified'])) {
        const o = loadLocalFile();
        // Force rewrite file, will update mtime
        writeLocalFile(data);
        return o;
      }
    } catch (e) { }

    const res = request('GET', 'https://pricing.us-east-1.amazonaws.com' + url);
    const data = JSON.parse(res.getBody('utf8'));
    writeLocalFile(data);
    return data;
  },

  parseBytes(str, outputUnit) {
    const m = String(str).match(/(\d+(?:\.\d+)?)\s*(?:([kMGTPE])[bo]?)?/i);
    if (!m) return undefined;
    const getFactor = m => Math.pow(1024, 'KMGTPE'.indexOf(m.toUpperCase()[0]));
    return +m[1] * getFactor(m[2] || 'k') / getFactor(outputUnit || 'k');
  },

  parseDuration(str, outputUnit) {
    const m = String(str).match(/(\d+(?:\.\d+)?)\s*(?:([dhms]))?/i);
    if (!m) return undefined;
    const getFactor = m => ({ d: 24 * 60 * 60, h: 60 * 60, m: 60, s: 1 }[m.toLowerCase()[0]]);
    return +m[1] * getFactor(m[2] || 'k') / getFactor(outputUnit || 'k');
  },

  strpad(str, size) {
    if (str.length < size) {
      str += ' '.repeat(size - str.length);
    }
    return str;
  }
};
