const path = require('path');

try {
    require('fs').unlinkSync('./dist');
} catch (ignored) {
}

const commonConfig = {
    externals: {
        "aws-sdk": "aws-sdk",
    },
    output: {
        path: path.resolve(__dirname),
        filename: './dist/[name].js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    node: {
        __dirname: false
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};

const configs = [
    Object.assign({
            target: 'node',
            entry: {
                main: './src/main.ts'
            },
        },
        commonConfig
    )
];

module.exports = configs;
