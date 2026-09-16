import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_admin_shot3";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  if (fs.existsSync(TEMP_USER_DATA)) {
    fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true });
  }

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

    // 1. Set localStorage for Admin user
    await send("Runtime.evaluate", {
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
        })()
      `,
    });

    // 2. Navigate to /admin/hardware
    console.log("Navigating to /admin/hardware...");
    await send("Page.navigate", { url: "http://localhost:3000/admin/hardware" });

    // Wait until loading spinner disappears (up to 15s)
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const check = await send("Runtime.evaluate", {
        expression: `
          (() => {
            const text = document.body.innerText;
            const hasVerifying = text.includes('Verifying Administrator Privileges');
            const hasHardware = text.includes('Hardware Management') || text.includes('Hardware Items');
            return { hasVerifying, hasHardware };
          })()
        `,
        returnByValue: true,
      });

      if (check.result?.value?.hasHardware) {
        console.log(`Page ready after ${i * 0.5}s!`);
        loaded = true;
        break;
      }
    }

    await sleep(1000);

    // Capture admin hardware page
    const res = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "admin_hardware_page.png"), Buffer.from(res.data, "base64"));
    console.log("Saved admin_hardware_page.png!");

    // 3. Click "+ Add Hardware" to capture the Add/Upload Hardware Modal
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Hardware'));
          if (addBtn) {
            addBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          }
        })()
      `,
    });
    await sleep(1200);

    const resModal = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "admin_hardware_modal.png"), Buffer.from(resModal.data, "base64"));
    console.log("Saved admin_hardware_modal.png!");

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
