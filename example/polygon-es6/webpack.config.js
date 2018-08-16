const path = require('path');

module.exports = {
    entry: './main.js',
    output: {
        filename: 'bundle.main.js',
        path: path.resolve(__dirname, 'dist')
    },
    watch:true,
    mode:'development'
};