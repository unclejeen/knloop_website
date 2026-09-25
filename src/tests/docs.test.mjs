import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import { docs } from "../lib/docs.ts";

const docsSiteRoot = resolve(import.meta.dirname, "../..");

describe("docs registry", () => {
  it("only keeps the installation guide", async () => {
    assert.equal(docs.length, 1);
    assert.equal(docs[0].slug, "install");
    await access(join(docsSiteRoot, docs[0].sourcePath.slice(1)));
  });

  it("install guide keeps key content", async () => {
    const install = await readFile(join(docsSiteRoot, docs[0].sourcePath.slice(1)), "utf8");
    assert.match(install, /安装/);
  });
});
