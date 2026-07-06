import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const edgePath = process.env.EDGE_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const siteUrl = process.env.SITE_URL ?? "http://localhost:4173";
const port = 9400 + Math.floor(Math.random() * 500);
const userDataDir = await mkdtemp(join(tmpdir(), "lunar-edge-qa-"));

const browser = spawn(edgePath, [
  "--headless",
  "--disable-gpu",
  "--disable-crash-reporter",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
]);

browser.stderr.on("data", () => {});
browser.stdout.on("data", () => {});

async function retry(fn, attempts = 50) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  throw lastError;
}

async function createTab() {
  return retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, {
      method: "PUT",
    });
    if (!response.ok) throw new Error(`Could not create browser tab: ${response.status}`);
    return response.json();
  });
}

function createClient(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message);
    }
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  return {
    async send(method, params = {}) {
      await opened;
      const commandId = ++id;
      ws.send(JSON.stringify({ id: commandId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(commandId, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.result.exceptionDetails) {
    throw new Error(JSON.stringify(response.result.exceptionDetails, null, 2));
  }
  return response.result.result.value;
}

async function waitForReady(client) {
  await retry(async () => {
    const readyState = await evaluate(client, "document.readyState");
    if (readyState !== "complete") throw new Error("Page is not ready yet");
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
}

async function checkViewport(client, label, width, height) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });
  await client.send("Page.navigate", { url: siteUrl });
  await waitForReady(client);

  return evaluate(
    client,
    `(async () => {
      const root = document.documentElement;
      await new Promise((resolve) => setTimeout(resolve, 250));
      for (let y = 0; y <= document.body.scrollHeight; y += 420) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 70));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 250));

      const productCards = document.querySelectorAll(".product-card");
      const productImages = [...document.querySelectorAll(".product-card img")];
      const naturalImages = productImages.filter((image) => image.naturalWidth > 0 && image.naturalHeight > 0);
      const input = document.querySelector('input[type="search"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, "serum");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 180));
      const serumCount = document.querySelectorAll(".product-card").length;

      return {
        label: "${label}",
        width: ${width},
        cards: productCards.length,
        loadedImages: naturalImages.length,
        serumCount,
        horizontalOverflow: root.scrollWidth - root.clientWidth,
        title: document.title,
      };
    })()`,
  );
}

let client;
try {
  const tab = await createTab();
  client = createClient(tab.webSocketDebuggerUrl);
  await client.send("Runtime.enable");
  await client.send("Page.enable");

  const results = [
    await checkViewport(client, "desktop", 1440, 1200),
    await checkViewport(client, "mobile", 390, 1200),
  ];

  const failures = [];
  for (const result of results) {
    if (result.cards !== 23) failures.push(`${result.label}: expected 23 product cards, got ${result.cards}`);
    if (result.loadedImages !== 23) failures.push(`${result.label}: expected 23 loaded product images, got ${result.loadedImages}`);
    if (result.serumCount < 4) failures.push(`${result.label}: serum search returned ${result.serumCount}`);
    if (result.horizontalOverflow > 0) failures.push(`${result.label}: horizontal overflow ${result.horizontalOverflow}px`);
  }

  console.log(JSON.stringify(results, null, 2));

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
} finally {
  client?.close();
  browser.kill();
  await Promise.race([
    new Promise((resolve) => browser.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
