import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_debug_admin";

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

    await send("Page.enable");
    await send("Runtime.enable");

    // Check localStorage before setting
    const pre = await send("Runtime.evaluate", {
      expression: "window.location.origin",
      returnByValue: true,
    });
    console.log("Origin:", pre.result?.value);

    // Call signIn directly via React or simulate login
    const loginResult = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const adminUser = {
            id: "admin-1",
            email: "admin@horizonpc.local",
            role: "admin",
            user_metadata: { username: "AdminHorizon" }
          };
          const adminSession = {
            access_token: "horizon_admin_token_admin-1_12345",
            user: adminUser
          };
          localStorage.setItem("horizon_local_session", JSON.stringify(adminSession));
          localStorage.setItem("horizon_local_users", JSON.stringify([{
            id: "admin-1",
            email: "admin@horizonpc.local",
            passwordHash: "dummy",
            username: "AdminHorizon",
            role: "admin",
            status: "active",
            created_at: new Date().toISOString()
          }]));
          return localStorage.getItem("horizon_local_session");
        })()
      `,
      returnByValue: true,
    });
    console.log("Saved local session:", loginResult.result?.value?.substring(0, 60));

    await send("Page.navigate", { url: "http://localhost:3000/admin/hardware" });
    await sleep(4000);

    const checkDom = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const storage = localStorage.getItem("horizon_local_session");
          const html = document.body.innerHTML;
          const text = document.body.innerText;
          return {
            url: window.location.href,
            storageKey: Boolean(storage),
            textSnippet: text.slice(0, 300),
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("DOM State:", checkDom.result?.value);

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
