require("./load-env.cjs");
const { spawnSync } = require("child_process");
const path = require("path");
const root = path.join(__dirname, "..");

let r = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
  env: process.env,
});
if (r.status) process.exit(r.status);

r = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
  env: process.env,
});
process.exit(r.status ?? 0);
