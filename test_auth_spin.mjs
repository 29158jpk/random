import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_auth_spin4";

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
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  await sleep(2500);

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

    console.log("Navigating to http://localhost:3000...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(4000);

    // 1. Sign in as Admin directly via __horizonAuth
    console.log("Signing in as Admin via window.__horizonAuth...");
    const loginRes = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          if (!window.__horizonAuth) return { ok: false, msg: "No __horizonAuth" };
          const res = await window.__horizonAuth.signIn("admin@horizonpc.local", "admin123456");
          return { ok: !res.error, error: res.error?.message };
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log("Login result:", loginRes.result?.value);
    await sleep(1500);

    // Verify login state
    const authCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const text = document.querySelector('header')?.innerText;
          const spinBtn = document.getElementById('random-engine')?.querySelector('button')?.innerText;
          return { header: text?.slice(0, 100), spinBtn };
        })()
      `,
      returnByValue: true,
    });
    console.log("Auth verified:", authCheck.result?.value);

    // 2. Click Spin Button in RandomPanel
    console.log("Clicking spin button in RandomPanel...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const container = document.getElementById('random-engine');
          const btn = container?.querySelector('button');
          if (btn) btn.click();
        })()
      `,
    });

    // Wait for slot animation & result popup (slot animation runs ~1.4s + popup transition = ~2.5s)
    console.log("Waiting for PC Result Modal...");
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const check = await send("Runtime.evaluate", {
        expression: `
          (() => {
            const text = document.body.innerText;
            const hasPcGenerated = text.includes('PC GENERATED!');
            const cardsCount = document.querySelectorAll('.group.glass-panel.rounded-2xl').length;
            return { hasPcGenerated, cardsCount };
          })()
        `,
        returnByValue: true,
      });
      if (check.result?.value?.hasPcGenerated) {
        console.log(`PC Result Modal popped up! Cards count: ${check.result?.value?.cardsCount}`);
        break;
      }
    }
    await sleep(800);

    // Capture screenshot of PC Result Modal!
    const resResult = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "pc_result_modal.png"), Buffer.from(resResult.data, "base64"));
    console.log("Saved pc_result_modal.png!");

    // 3. Click the first hardware card inside the modal to open Hardware Detail Modal
    console.log("Clicking hardware card...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('.group.glass-panel.rounded-2xl'));
          if (cards.length > 0) cards[0].click();
        })()
      `,
    });
    await sleep(1500);

    // Capture screenshot of Hardware Detail Modal!
    const resDetail = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "hardware_detail_modal.png"), Buffer.from(resDetail.data, "base64"));
    console.log("Saved hardware_detail_modal.png!");

    // 4. Navigate to /admin/hardware
    console.log("Navigating to /admin/hardware...");
    await send("Page.navigate", { url: "http://localhost:3000/admin/hardware" });
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const checkAdmin = await send("Runtime.evaluate", {
        expression: `document.body.innerText.includes('Hardware Management')`,
        returnByValue: true,
      });
      if (checkAdmin.result?.value) {
        console.log("Admin Hardware page loaded!");
        break;
      }
    }
    await sleep(800);

    const resAdmin = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "admin_hardware_page.png"), Buffer.from(resAdmin.data, "base64"));
    console.log("Saved admin_hardware_page.png!");

    // 5. Click "+ Add Hardware" to open Add/Upload Hardware Modal
    console.log("Clicking + Add Hardware...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Hardware'));
          if (addBtn) addBtn.click();
        })()
      `,
    });
    await sleep(1200);

    const resAdminModal = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "admin_hardware_modal.png"), Buffer.from(resAdminModal.data, "base64"));
    console.log("Saved admin_hardware_modal.png!");

    ws.close();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    chromeProcess.kill();
  }
}

run();
