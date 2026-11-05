import assert from "node:assert/strict";
import test from "node:test";

async function renderPath(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders studio home page with english-mate case", async () => {
  const response = await renderPath("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /搞定创造工作室/);
  assert.match(html, /拿来练英语 · AI 英语学习小程序/);
  assert.match(html, /在线体验/);
});

test("server-renders english-mate case detail with interactive demo iframe and custom story", async () => {
  const response = await renderPath("/cases/english-mate");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /拿来练英语 · AI 英语学习小程序/);
  assert.match(html, /LIVE DEMO \/ 交互原型在线体验/);
  assert.match(html, /\/demos\/english-mate\?frame=1/);
  assert.match(html, /从自有资料出发，/);
  assert.match(html, /01 · 首页（个人语言手册）/);
});

test("preserves existing case detail page story fallback", async () => {
  const response = await renderPath("/cases/mining-dashboard");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /矿山运营管理平台大屏/);
  assert.match(html, /从分散信息，/);
});

test("server-renders standalone english-mate interactive demo route", async () => {
  const response = await renderPath("/demos/english-mate?frame=1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /em-app/);
  assert.match(html, /拿来练英语/);
  assert.match(html, /tab-bar/);
});
