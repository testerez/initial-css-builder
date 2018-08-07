import * as path from "path";
import * as fs from "fs";

describe("realLifeTests", () => {
  const testsDirectory = path.join(__dirname, "tests");
  fs.readdirSync(testsDirectory).forEach(d => {
    it(d, () => {});
  });
});
