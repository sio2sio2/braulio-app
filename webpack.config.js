const webpack = require("webpack"),
      path = require("path"),
      merge = require("webpack-merge"),
      HtmlWebPackPlugin = require("html-webpack-plugin"),
      MiniCssExtractPlugin = require("mini-css-extract-plugin"),
      name = require("./package.json").name;

let params;
try {
   params = require("./keys.json");
   params = {
      apiKey: JSON.stringify(params.apiKey),
      clientId: JSON.stringify(params.clientId),
      hosted_domain: JSON.stringify(params.hosted_domain)
   }
}
catch(err) {
   params = {}
}


// Configuración para Babel
function confBabel(env) {
   return {
      module: {
         rules: [
            {
               test: /\.js$/,
               exclude: /node_modules/,
               use: {
                  loader: "babel-loader",
                  options: {
                     presets: [["@babel/env", {
                        debug: env.debug,
                        corejs: 3,
                        useBuiltIns: "usage"
                     }]]
                  }
               }
            },
         ]
      }
   }
}


// Configuración para desarrollo
function confDev(filename) {
   return {
      devtool: false,
      plugins: [
         new webpack.SourceMapDevToolPlugin({
            filename: `${filename}.map`
         })
      ],
      devServer: {
         contentBase: false,
         open: "chromium",
      }
   }
}


module.exports = env => {
   let mode;
   switch(env.output) {
      case "debug":
         mode = "development";
         break;
      default:
         mode = "production";
   }

   const filename = "js/[name].js";
   const common = {
      mode: mode,
      entry: {
         [name]: "./src/index.js"
      },
      output: {
         path: path.resolve(__dirname, "docs"),
         filename: filename
      },
      resolve: {
         alias: {
            app: __dirname
         }
      },
      module: {
         rules: [
            {
               test: /\.html$/,
               use: ["html-loader?minimize=true"]
            },
            {
               test: /\.(css|sass)$/,
               use: [MiniCssExtractPlugin.loader,
                     `css-loader?sourceMap=${mode === "development"}`,
                     { 
                        loader: `postcss-loader?sourceMap=${mode === "development"}`,
                        options: {
                           plugins: () => [
                              require("autoprefixer"),
                              require("cssnano")({preset: "default"})
                           ]
                        }
                     },
                     `sass-loader?sourceMap=${mode === "development"}`]
            },
            {
               test: /\.(png|jpe?g|gif|svg)$/i,
               use: [
                  'url-loader?limit=4096&name=images/[name].[ext]'
               ]
            }
         ]
      },
      plugins: [
         new HtmlWebPackPlugin({
            template: "src/index.html",
         }),
         new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "[id].css"
         }),
         new webpack.DefinePlugin(params),
         new webpack.ProvidePlugin({
            gapi: "gapi-client"
         })
      ],
      externals: {
         "gapi-client": "gapi"
      }
   }

   return merge.smart(
      common,
      mode === "production"?confBabel(env):confDev(filename),
   );
}
