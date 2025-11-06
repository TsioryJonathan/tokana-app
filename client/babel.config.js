module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === "production" || api.env("production");
  
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Les console.log seront supprimés par Metro minifier en production
    ],
  };
};
