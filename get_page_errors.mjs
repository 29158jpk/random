import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_get_errors";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--disable-gpu",
      "--remote-debugging-port=9222",
      `--user-data-dir=${TEMP_USER_DATA}`,
      "--window-size=1440,960",
      "http://localhost:3000",
    ],
    { stdio: "ignore" }
  );

  await sleep(3000);

  try {
    const targetsRes = await fetch("http://localhost:9222/json");
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === "page") || targets[0];

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener("open", resolve));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener("message", handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const consoleMessages = [];
    const exceptions = [];

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Runtime.consoleAPICalled") {
        consoleMessages.push(data.params);
      }
      if (data.method === "Runtime.exceptionThrown") {
        exceptions.push(data.params.exceptionDetails);
      }
    });

    await send("Runtime.enable");
    await send("Page.enable");
    await sleep(4000);

    console.log("=== CONSOLE MESSAGES (" + consoleMessages.length + ") ===");
    for (const msg of consoleMessages) {
      console.log(msg.type, msg.args.map((a) => a.value || a.description || JSON.stringify(a)).join(" "));
    }

    console.log("=== EXCEPTIONS (" + exceptions.length + ") ===");
    for (const ex of exceptions) {
      console.log(ex.text, ex.exception?.description || ex.exception?.value);
    }

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
