import babel from "@rollup/plugin-babel";

const input = './js/index.js';
const external = ['canvasom'];

export default [
    {
        input,
        plugins: [
            babel({
                babelHelpers: 'bundled',
                presets: [
                    ['@babel/preset-env', {
                        loose: true,
                    }],
                ],
            }),
        ],
        external,
        output: {
            format: 'umd',
            name: 'BOM',
            file: './dist/boxom.umd.js',
            globals: {
                canvasom: 'COM'
            },
        },
    },
    {
        input,
        external,
        output: {
            format: 'esm',
            file: './dist/boxom.js',
        },
    },
];
