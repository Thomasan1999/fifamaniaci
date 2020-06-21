"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
module.exports = {
    configureWebpack: {
        plugins: __spreadArrays((process.env.NODE_ENV === "production" ? [
            new webpack_bundle_analyzer_1.BundleAnalyzerPlugin({
                analyzerMode: "static",
                analyzerPort: 8888
            })
        ] : [])),
        watchOptions: {
            ignored: ["node_modules", "backup", "package.json", "package-lock.json", ".eslintrc.js", ".gitignore"]
        }
    },
    devServer: {
        https: {
            key: fs.readFileSync("./ssl/localhost.key"),
            cert: fs.readFileSync("./ssl/localhost.crt"),
            ca: fs.readFileSync("./ssl/ca.ssl.indexnl.com.crt")
        },
        port: 8080
    },
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: "stylus",
            patterns: [
                path.resolve(__dirname, "./src/styles/variables.styl"),
                path.resolve(__dirname, "./src/styles/tomwork.functions.styl")
            ]
        },
        webpackBundleAnalyzer: {
            openAnalyzer: false
        }
    },
    pwa: {
        name: "FIFA maniaci",
        workboxOptions: {
            exclude: [/\.html$/]
        },
        iconPaths: [
            {
                src: "./img/icons/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "./img/icons/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ],
        backgroundColor: "#1e1e1e",
        msTileColor: "#03a9f4",
        themeColor: "#03a9f4"
    }
};
//# sourceMappingURL=vue.config.js.map
