// @ts-check

const td = require('typedoc');
const ts = require('typescript');

/**
 * @param {Object} options
 *  @param {string} options.entryPoint
 *  @param {string} options.outDir
 * @param {Partial<import('typedoc').TypeDocOptions>} [typeDocOptions]
 */
async function createTypeScriptApiDocs({entryPoint, outDir}, typeDocOptions) {
    const app = new td.Application();
    app.options.addReader(new td.TSConfigReader());

    app.bootstrap({
        entryPoints: [entryPoint],
        tsconfig: 'tsconfig.json',
        ...typeDocOptions,
    });

    const program = ts.createProgram(
        app.options.getFileNames(),
        app.options.getCompilerOptions()
    );

    const project = app.converter.convert(
        app.expandInputFiles(app.options.getValue('entryPoints')),
        program
    );

    if (project) {
        await app.generateDocs(project, outDir);
    } else {
        throw new Error(`Error creating the TypeScript API docs for ${entryPoint}.`);
    }
}

createTypeScriptApiDocs({entryPoint: 'src/library/index.ts', outDir: 'docs'}, {
    excludeInternal: true,
    categorizeByGroup: true,
    theme: 'minimal'
})
