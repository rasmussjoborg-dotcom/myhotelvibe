import fs from "node:fs"
import path from "node:path"

const projectRoot = path.resolve(import.meta.dirname, "..")
const distDir = path.join(projectRoot, "dist")

const indexPath = path.join(distDir, "index.html")
if (!fs.existsSync(indexPath)) {
  console.error("Missing dist/index.html. Run `npm run build` first.")
  process.exit(1)
}

const html = fs.readFileSync(indexPath, "utf8")
const jsFile =
  (html.match(/src="\.\/assets\/(index-[^"]+\.js)"/) || [])[1] ?? null
const cssFile =
  (html.match(/href="\.\/assets\/(index-[^"]+\.css)"/) || [])[1] ?? null

if (!jsFile || !cssFile) {
  console.error("Could not locate built asset filenames in dist/index.html.")
  process.exit(1)
}

const rawJs = fs.readFileSync(path.join(distDir, "assets", jsFile), "utf8")
const rawCss = fs.readFileSync(path.join(distDir, "assets", cssFile), "utf8")

// When inlining assets into dist/standalone.html, relative URLs in the built
// CSS/JS stop being relative to dist/assets/* and become relative to standalone.html.
// Fix up the common Vite asset patterns so standalone works over file://.
const fixCss = (cssText) => {
  // E.g. url(./geist-latin-....woff2) -> url(./assets/geist-latin-....woff2)
  return cssText.replace(/url\(\.\/([^)]+)\)/g, "url(./assets/$1)")
}

const fixJs = (jsText) => {
  // E.g. new URL("treehotel-....png", import.meta.url).href
  //  ->  new URL("./assets/treehotel-....png", import.meta.url).href
  return jsText.replace(
    /new URL\("([^"]+)",\s*import\.meta\.url\)\.href/g,
    'new URL("./assets/$1", import.meta.url).href'
  )
}

const js = fixJs(rawJs)
const css = fixCss(rawCss)
const buildStamp = new Date().toISOString()

const fileHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>My Hotel Vibe — Local Preview</title>
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <!-- build: ${buildStamp} -->
    <link rel="stylesheet" href="./assets/${cssFile}?v=${encodeURIComponent(buildStamp)}">
  </head>
  <body>
    <div id="root">
      <div style="font:14px/1.4 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px;color:#444;">
        Loading My Hotel Vibe…
      </div>
    </div>
    <script type="module" src="./assets/${jsFile}?v=${encodeURIComponent(buildStamp)}"></script>
  </body>
</html>
`

const out = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>My Hotel Vibe — Standalone Preview</title>
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <!-- build: ${buildStamp} -->
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      ${js}
    </script>
  </body>
</html>
`

fs.writeFileSync(path.join(distDir, "standalone.html"), out, "utf8")
fs.writeFileSync(path.join(distDir, "file.html"), fileHtml, "utf8")
console.log("Wrote dist/standalone.html")
console.log("Wrote dist/file.html")
