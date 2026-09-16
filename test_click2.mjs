import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_test_click2";

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

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Runtime.consoleAPICalled") {
        console.log("[Console]", data.params.args.map((a) => a.value || a.description).join(" "));
      }
    });

    await send("Runtime.enable");
    await send("Page.enable");
    await sleep(2000);

    const test = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          // Find the spin button inside RandomPanel
          const spinBtn = buttons.find(b => b.innerText.includes('RANDOM PC (LOGIN REQUIRED)'));
          console.log("Found RandomPanel spinBtn:", Boolean(spinBtn), spinBtn?.innerText);
          if (spinBtn) {
            spinBtn.click();
          }
          return { found: Boolean(spinBtn) };
        })()
      `,
      returnByValue: true,
    });
    console.log("Found:", test.result?.value);

    await sleep(1500);

    const checkModal = await send("Runtime.evaluate", {
      expression: `
        (() => {
          return {
            hasLoginRequired: document.body.innerText.includes('LOGIN REQUIRED'),
            hasPleaseLogin: document.body.innerText.includes('Please login before generating your PC'),
            modalsInDom: document.querySelectorAll('.fixed').length
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Modal Check:", checkModal.result?.value);

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
