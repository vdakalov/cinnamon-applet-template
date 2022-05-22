const fs = require('fs');
const path = require('path');
const os = require('os');
const pkg = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');

const libName = pkg.name.replace(/(^.|-.)/g, c =>
  (c.startsWith('-') ? c.slice(1) : c).toUpperCase());
/**
 *
 * @type {CopyPlugin.Pattern[]}
 */
const extraCopyPatterns = [];
const defaultSourceFile = 'package.json';

// metadata loading
const meta = {};
let cpMetaFrom = 'metadata.json';
if (fs.existsSync('./' + cpMetaFrom)) {
  Object.assign(meta, require('./' + cpMetaFrom));
} else {
  // just any existent file to override by CopyPlugin transform
  cpMetaFrom = defaultSourceFile;
}

// get defined UUID or create one
const UUID = typeof meta.uuid === 'string' && meta.uuid.length !== 0
  ? meta.uuid : `${pkg.name}@${os.hostname()}.local`;

// store uuid into file
const uuidFilename = path.join(os.tmpdir(), 'applet-uuid');
fs.writeFileSync(uuidFilename, UUID, { encoding: 'utf8' });

// copy existent or defined metadata.json and define undefined fields
extraCopyPatterns.push({
  from: cpMetaFrom,
  to: 'metadata.json',
  /**
   *
   * @param {Buffer} content
   * @return {Buffer|string}
   */
  transform(content) {
    let hasChanged = false;
    if (!meta.hasOwnProperty('uuid')) {
      meta.uuid = UUID;
      hasChanged = true;
    }
    if (!meta.hasOwnProperty('version')) {
      meta.version = pkg.version;
      hasChanged = true;
    }
    if (!meta.hasOwnProperty('last-edited')) {
      meta['last-edited'] = Date.now().toString().slice(0, -3);
      hasChanged = true;
    }
    if (!meta.hasOwnProperty('name')) {
      meta.name = pkg.name.replace(/(^.|-)/g, c => c === '-' ? ' ' : c.toUpperCase());
      hasChanged = true;
    }
    if (!meta.hasOwnProperty('description')) {
      if (typeof pkg.description === 'string' && pkg.description.length !== 0) {
        meta.description = pkg.description;
        hasChanged = true;
      }
    }
    if (!meta.hasOwnProperty('author')) {
      if (typeof pkg.author === 'string' && pkg.author.length !== 0) {
        meta.author = pkg.author.replace(/\s+<.+?>/, '');
        hasChanged = true;
      } else if (Array.isArray(pkg.contributors) && pkg.contributors.length !== 0) {
        const contributor = pkg.contributors[0].name;
        if (typeof contributor.name === 'string' && contributor.name.length !== 0) {
          meta.author = contributor.name;
          hasChanged = true;
        }
      }
    }
    if (hasChanged) {
      return JSON.stringify(meta, undefined, 2);
    }
    return content;
  }
});

// applet.js loading
let cpAppletFrom = 'applet.js';
if (!fs.existsSync('./' + cpAppletFrom)) {
  cpAppletFrom = defaultSourceFile;
}

// copy existent or fake applet.js file and define real applet file in it
extraCopyPatterns.push({
  from: cpAppletFrom,
  to: 'applet.js',
  /**
   *
   * @param {Buffer} content
   * @return {Buffer|string}
   */
  transform(content) {
    const isDebugMode = process.env.NODE_ENV !== 'production';
    const filename = `${__dirname}/build/${pkg.name}.js`;
    if (cpAppletFrom === defaultSourceFile) {
      // return `function main(...args) {\n  return new imports.applets['${UUID}']['${pkg.name}']['${libName}']['default'](...args);\n}\n`;
      const buffer = ['function main(...args) {'];
      const iconsPath = path.join(__dirname, '/assets/icons');
      if (fs.existsSync(iconsPath) && fs.readdirSync(iconsPath).length !== 0) {
        buffer.push([
          '  ',
          'imports.gi.Gtk.IconTheme.get_default().append_search_path(',
          'imports.ui.appletManager.appletMeta[\'', UUID, '\'].path + \'/icons\');'
        ].join(''));
      }
      buffer.push([
        '  ',
        'return new imports.applets[\'', UUID, '\']',
        '[\'', pkg.name, '\']',
        '[\'', libName, '\']',
        '[\'default\']',
        '(' + isDebugMode + ', ...args);'
      ].join(''));
      buffer.push('}')
      return buffer.join('\n');
    }
    let index = 0;
    while ((index = content.indexOf('%f')) !== -1) {
      content = Buffer.concat([
        content.slice(0, index),
        Buffer.from(filename, 'utf8'),
        content.slice(index + 2, content.length)
      ]);
    }
    return content;
  }
})

module.exports = {
  mode: 'development',
  entry: [
    './src/index.ts'
  ],
  target: 'node',
  devtool: 'inline-source-map',
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader'
    }]
  },
  resolve: {
    extensions: ['.ts']
  },
  output: {
    filename: pkg.name + '.js',
    // path: path.join(os.homedir(), '.local/share/cinnamon/applets', meta.uuid)
    path: path.join(__dirname, 'build'),
    library: {
      name: libName,
      type: 'var'
    },
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: '**/*', context: 'assets' },
        {
          from: 'package.json',
          to: 'uuid.txt',
          transform() {
            return UUID;
          }
        },
        ...extraCopyPatterns
      ]
    })
  ]
};
