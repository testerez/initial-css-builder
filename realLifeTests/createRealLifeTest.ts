import path from "path";
import * as fs from "fs";

// Save a web page with chrome then excecute this script passing path to html file
// as first argument

const toFileName = (s: string) =>
  s
    .replace(/[^\d\w]+/g, "-")
    .trim()
    .toLocaleLowerCase();

(async () => {
  const pagePath = process.argv[2];
  const pagePathNoExt = pagePath.replace(/\.htm$/i, "");
  const filesPath = pagePathNoExt + "_files";
  const testJsonPath = path.join(
    __dirname,
    "testsData",
    toFileName(path.basename(pagePathNoExt)) + ".json"
  );

  const html = fs.readFileSync(pagePath, "utf-8");
  const css = fs
    .readdirSync(filesPath)
    .filter(f => /\.css$/i.test(f))
    .map(f => fs.readFileSync(path.resolve(filesPath, f), "utf-8"))
    .join("\n");

  fs.writeFileSync(testJsonPath, JSON.stringify({ html, css }, null, 2));
})();
