import * as fs                from 'fs';
import * as path              from 'path';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
// eslint-disable-next-line import/no-extraneous-dependencies
import {ProjectOptions}       from '@vue/cli-service';
// eslint-disable-next-line import/no-extraneous-dependencies
import {GenerateSWOptions}    from 'workbox-webpack-plugin';

module.exports = {
    configureWebpack: {
        plugins: [
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
        workboxOptions: {
            exclude: [/\.html$/]
        } as GenerateSWOptions,
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
} as ProjectOptions;
