require("./load-env.cjs");
const { spawnSync } = require("child_process");
const path = require("path");

const r = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: true,
  cwd: path.join(__dirname, ".."),
  env: process.env,
});
process.exit(r.status ?? 1);
