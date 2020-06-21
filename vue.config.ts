import * as fs                from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as path              from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import {GenerateSW}           from 'workbox-webpack-plugin';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as webpack           from 'webpack';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as webpackDevServer  from 'webpack-dev-server';

module.exports = {
    configureWebpack: {
        plugins: [
            new GenerateSW({
                exclude: [/\.html$/]
            }),
            ...(process.env.NODE_ENV === `production` ? [
                new BundleAnalyzerPlugin({
                    analyzerMode: `static`,
                    analyzerPort: 8888
                })
            ] : [])
        ],
        watchOptions: {
            ignored: [`node_modules`, `backup`, `package.json`, `package-lock.json`, `.eslintrc.js`, `.gitignore`]
        }
    },

    devServer: {
        https: {
            key: fs.readFileSync(`./ssl/localhost.key`),
            cert: fs.readFileSync(`./ssl/localhost.crt`),
            ca: fs.readFileSync(`./ssl/ca.ssl.indexnl.com.crt`)
        },
        port: 8080
    },

    pluginOptions: {
        'style-resources-loader': {
            preProcessor: `stylus`,
            patterns: [
                path.resolve(__dirname, `./src/styles/variables.styl`),
                path.resolve(__dirname, `./src/styles/tomwork.functions.styl`)]
        },
        webpackBundleAnalyzer: {
            openAnalyzer: false
        }
    },

    pwa: {
        name: `FIFA maniaci`,
        iconPaths: [
            {
                src: `./img/icons/android-chrome-192x192.png`,
                sizes: `192x192`,
                type: `image/png`
            },
            {
                src: `./img/icons/android-chrome-512x512.png`,
                sizes: `512x512`,
                type: `image/png`
            }
        ],
        backgroundColor: `#1e1e1e`,
        msTileColor: `#03a9f4`,
        themeColor: `#03a9f4`
    }
} as {
    assetsDir?: string,
    css?: object,
    configureWebpack?: webpack.Configuration,
    crossorigin?: string,
    devServer?: webpackDevServer.Configuration,
    filenameHashing?: boolean,
    indexPath?: string,
    integrity?: boolean,
    lintOnSave?: boolean | 'warning' | 'default' | 'error',
    outputDir?: string,
    pages?: {
        [s: string]: string | {
            chunks?: string[],
            entry: string,
            filename?: string,
            template?: string,
            title?: string
        }
    },
    parallel?: boolean | number,
    pluginOptions?: {
        [s: string]: object
    },
    productionSourceMap?: boolean,
    publicPath?: string,
    pwa?: {
        appleMobileWebAppCapable?: 'yes' | 'no',
        appleMobileWebAppStatusBarStyle?: string,
        assetsVersion?: string,
        iconPaths: { [s: string]: string } | { src: string, sizes: string, type: string }[],
        manifestPath?: string,
        manifestOptions?: {
            display?: string,
            name?: string,
            short_name?: string,
            start_url?: string,
            theme_color?: string
        },
        name: string,
        msTileColor?: string,
        themeColor?: string,
        workboxPluginMode?: 'GenerateSW' | 'InjectManifest',
        workboxOptions?: {
            swSrc?: string
        }
    },
    runtimeCompiler?: boolean,
    transpileDependencies?: (string | RegExp)[]
};
