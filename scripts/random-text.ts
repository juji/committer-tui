import { randomBytes } from "node:crypto";

const path = process.argv[2] ?? "random.txt";
await Bun.write(path, randomBytes(32).toString("hex") + "\n");
console.log(`wrote random text to ${path}`);
