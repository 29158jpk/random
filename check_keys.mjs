import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_keys2";

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
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  await sleep(2500);

  try {
    const targetsRes = await fetch("http://localhost:9222/json");
    const targets = await targetsRes.json();
    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
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

    await send("Page.enable");
    await send("Runtime.enable");

    // Navigate to localhost:3000 and wait
    console.log("Navigating to http://localhost:3000...");
    await send("Page.navigate", { url: "http://localhost:3000" });

    // Wait until document.readyState is complete and buttons > 10
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const res = await send("Runtime.evaluate", {
        expression: `
          (() => {
            const btns = document.querySelectorAll('button');
            return {
              readyState: document.readyState,
              buttonCount: btns.length,
              firstBtnText: btns[0]?.innerText
            };
          })()
        `,
        returnByValue: true,
      });
      if (res.result?.value?.buttonCount > 10) {
        console.log(`Page hydrated and ready after ${i * 0.5}s! Total buttons: ${res.result?.value?.buttonCount}`);
        ready = true;
        break;
      }
    }

    // Now check React keys
    const res = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector('button');
          return {
            keys: Object.keys(btn || {}),
            reactPropKey: Object.keys(btn || {}).find(k => k.includes('Props') || k.includes('react')),
            text: btn?.innerText,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("React key inspection:", res.result?.value);

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
