const glob = require('glob');

const input = glob('./*/*.vue', {sync: true}).filter(
    (path) => {
        const COMPONENT_PATH = /\.\/(\w*)\/(\w*)\.vue$/;
        const [any, folder, file] = COMPONENT_PATH.exec(path) || [];
        return (any && folder === file);
    },
);

module.exports = {
    input,
    banner: true,
    filename: 'src/library/index.ts',
    formats: ['es'],
    plugins: [],
};
