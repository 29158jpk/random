import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_test_react_props";

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

    await send("Runtime.enable");
    await send("Page.enable");
    await sleep(2500);

    const checkProps = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const spinBtn = buttons.find(b => b.innerText.includes('RANDOM PC (LOGIN REQUIRED)'));
          if (!spinBtn) return "No spinBtn";

          const reactKey = Object.keys(spinBtn).find(k => k.startsWith('__reactProps'));
          const props = reactKey ? spinBtn[reactKey] : null;

          if (props && typeof props.onClick === 'function') {
            try {
              props.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
              return "Invoked props.onClick successfully!";
            } catch (err) {
              return "Error in onClick: " + err.message;
            }
          }
          return { reactKey, hasProps: Boolean(props), hasOnClick: Boolean(props?.onClick) };
        })()
      `,
      returnByValue: true,
    });
    console.log("React Props Check:", checkProps.result?.value);

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
