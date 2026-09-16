import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_full_journey";

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
    await sleep(3500);

    // 1. Trigger Login Modal via button in navbar
    console.log("Clicking Navbar Login button to authenticate...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const loginBtn = btns.find(b => b.innerText.trim() === 'Login');
          if (loginBtn) loginBtn.click();
        })()
      `,
    });
    await sleep(800);

    // 2. Fill login form
    console.log("Filling email and password in AuthModal...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const emailInput = document.querySelector('input[type="email"]');
          const passInput = document.querySelector('input[type="password"]');
          if (emailInput && passInput) {
            emailInput.value = "gamer@horizonpc.local";
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            passInput.value = "GamerPass123!";
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Submit form
            const form = emailInput.closest('form');
            if (form) {
              const submitBtn = form.querySelector('button[type="submit"]');
              if (submitBtn) submitBtn.click();
              else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
          }
        })()
      `,
    });
    await sleep(1500);

    // Check if user is logged in
    const authCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const hasUser = Boolean(localStorage.getItem('horizon_local_session'));
          const btnText = document.getElementById('random-engine')?.querySelector('button')?.innerText;
          return { hasUser, btnText };
        })()
      `,
      returnByValue: true,
    });
    console.log("Auth State:", authCheck.result?.value);

    // 3. Now click the spin button in RandomPanel!
    console.log("Spinning PC as authenticated user...");
    const spinClick = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const container = document.getElementById('random-engine');
          const btn = container ? Array.from(container.querySelectorAll('button')).find(b => b.innerText.includes('RANDOM PC')) : null;
          if (btn) {
            btn.click();
            return { clicked: true, text: btn.innerText };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true,
    });
    console.log("Spin Click:", spinClick.result?.value);

    // Wait for slot animation & result popup (slot runs ~1.4s + popup transition = ~2.5s)
    console.log("Waiting for slot animation and PC Result Modal...");
    await sleep(3500);

    const checkResultModal = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const text = document.body.innerText;
          return {
            hasPcGenerated: text.includes('PC GENERATED!'),
            hasLuckScore: text.includes('Luck Score'),
            hasComponents: text.includes('Hardware Components (8 ชิ้น)')
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Result Modal DOM Check:", checkResultModal.result?.value);

    // Capture screenshot of PC Result Modal!
    const resResult = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "pc_result_modal.png"), Buffer.from(resResult.data, "base64"));
    console.log("Saved pc_result_modal.png!");

    // 4. Click first component card to open Hardware Detail Modal
    console.log("Clicking hardware card...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('.group.glass-panel.rounded-2xl'));
          if (cards.length > 0) {
            cards[0].click();
          }
        })()
      `,
    });
    await sleep(1500);

    const checkDetail = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const text = document.body.innerText;
          return {
            hasDetails: text.includes('DETAILS'),
            hasCompatibility: text.includes('Compatibility Analysis')
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Detail Modal Check:", checkDetail.result?.value);

    // Capture screenshot of Hardware Detail Modal!
    const resDetail = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "hardware_detail_modal.png"), Buffer.from(resDetail.data, "base64"));
    console.log("Saved hardware_detail_modal.png!");

    ws.close();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    chromeProcess.kill();
  }
}

run();
