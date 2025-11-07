const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Optimisations pour réduire la taille du bundle
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      // Réduire la taille du code
      passes: 3,
      drop_console: process.env.NODE_ENV === "production",
      drop_debugger: true,
      pure_funcs: process.env.NODE_ENV === "production" ? ["console.log", "console.info", "console.debug"] : [],
    },
  },
};

// Appliquer NativeWind
const finalConfig = withNativeWind(config, { input: "./app/globals.css" });

module.exports = finalConfig;
