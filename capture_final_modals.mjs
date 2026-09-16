import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_final_capture";

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

    // 1. Wait for window.__horizonAuth to be available
    console.log("Waiting for window.__horizonAuth...");
    let authed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const res = await send("Runtime.evaluate", {
        expression: `Boolean(window.__horizonAuth && window.__horizonAuth.signIn)`,
        returnByValue: true,
      });
      if (res.result?.value) {
        console.log(`window.__horizonAuth ready after ${i * 0.5}s!`);
        authed = true;
        break;
      }
    }

    // 2. Sign in as Admin
    console.log("Signing in as Admin...");
    const loginResult = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          const res = await window.__horizonAuth.signIn("admin@horizonpc.local", "admin123456");
          return res;
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log("Sign in result:", loginResult.result?.value);
    await sleep(1500);

    // 3. Find and click the REAL RANDOM PC button
    console.log("Locating and clicking RANDOM PC button...");
    const clickSpin = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          // Find the real spin button in RandomPanel (text is '🎲 RANDOM PC')
          const spinBtn = btns.find(b => b.innerText.trim() === '🎲 RANDOM PC') ||
                          btns.find(b => b.innerText.includes('RANDOM PC'));
          if (spinBtn) {
            spinBtn.click();
            return { clicked: true, text: spinBtn.innerText };
          }
          return { clicked: false, availableButtons: btns.map(b => b.innerText.trim()).filter(Boolean) };
        })()
      `,
      returnByValue: true,
    });
    console.log("Spin click:", clickSpin.result?.value);

    // 4. Wait for slot animation & result popup
    console.log("Waiting for PCResultModal...");
    let modalAppeared = false;
    for (let i = 0; i < 25; i++) {
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
        console.log(`PCResultModal opened after ${i * 0.5}s! Cards: ${check.result?.value?.cardsCount}`);
        modalAppeared = true;
        break;
      }
    }
    await sleep(1000);

    // 5. Capture PC Result Modal!
    const resResult = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "pc_result_modal.png"), Buffer.from(resResult.data, "base64"));
    console.log("Saved pc_result_modal.png!");

    // 6. Click GPU / CPU hardware card
    console.log("Clicking hardware card...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('.group.glass-panel.rounded-2xl'));
          const gpuCard = cards.find(c => c.innerText.includes('GPU')) || cards[0];
          if (gpuCard) gpuCard.click();
        })()
      `,
    });
    await sleep(1500);

    // 7. Capture Hardware Detail Modal!
    const resDetail = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "hardware_detail_modal.png"), Buffer.from(resDetail.data, "base64"));
    console.log("Saved hardware_detail_modal.png!");

    // 8. Navigate to /admin/hardware
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
    await sleep(1000);

    const resAdmin = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "admin_hardware_page.png"), Buffer.from(resAdmin.data, "base64"));
    console.log("Saved admin_hardware_page.png!");

    // 9. Click "+ Add Hardware" to capture Add Hardware modal with Image Upload
    console.log("Opening Add Hardware Modal...");
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
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
