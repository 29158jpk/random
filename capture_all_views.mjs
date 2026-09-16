import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
// Use forward slashes or double backslashes to avoid \a escape
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_cdp_profile_final";

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

    async function capture(filename) {
      const res = await send("Page.captureScreenshot", { format: "png" });
      const buffer = Buffer.from(res.data, "base64");
      const outPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    }

    await sleep(2500);

    // 1. Click Hero RANDOM PC to trigger Login Required Modal
    console.log("Triggering Login Required Modal...");
    await send("Runtime.evaluate", {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('RANDOM PC'));
        if (btn) btn.click();
      `,
    });
    await sleep(800);
    await capture("modal_login_required.png");

    // 2. Click Login on the modal to open AuthModal
    console.log("Opening Auth Modal...");
    await send("Runtime.evaluate", {
      expression: `
        const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Login');
        if (loginBtn) loginBtn.click();
      `,
    });
    await sleep(800);
    await capture("modal_auth.png");

    // 3. Log in as member via local auth engine directly in browser
    console.log("Authenticating as member...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          // Put demo user in localStorage horizon_user / horizon_session
          const demoUser = {
            id: "user-demo-1",
            email: "gamer@horizon.pc",
            role: "authenticated",
            user_metadata: { username: "HorizonGamer" }
          };
          const demoSession = {
            access_token: "horizon-mock-token-user",
            user: demoUser
          };
          localStorage.setItem("horizon_user", JSON.stringify(demoUser));
          localStorage.setItem("horizon_session", JSON.stringify(demoSession));
          window.location.reload();
        })()
      `,
    });
    await sleep(3500);

    // 4. Trigger PC Generation as logged in user!
    console.log("Spinning PC as authenticated user...");
    await send("Runtime.evaluate", {
      expression: `
        const spinBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('RANDOM PC'));
        if (spinBtn) spinBtn.click();
      `,
    });

    // Wait for slot animation & result popup (slot animation runs ~2.8s)
    await sleep(4000);
    await capture("modal_pc_result.png");

    // 5. Click first hardware card in the result modal to open Hardware Detail Modal!
    console.log("Clicking hardware card to open detail modal...");
    await send("Runtime.evaluate", {
      expression: `
        // Click on the GPU or CPU card
        const card = document.querySelector('.cursor-pointer');
        if (card) card.click();
      `,
    });
    await sleep(800);
    await capture("modal_hardware_detail.png");

    // 6. Navigate to Admin Hardware page
    console.log("Navigating to /admin/hardware...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const adminUser = {
            id: "admin-demo-1",
            email: "admin@horizon.pc",
            role: "admin",
            user_metadata: { username: "HorizonAdmin" }
          };
          const adminSession = {
            access_token: "horizon-mock-token-admin",
            user: adminUser
          };
          localStorage.setItem("horizon_user", JSON.stringify(adminUser));
          localStorage.setItem("horizon_session", JSON.stringify(adminSession));
          window.location.href = "/admin/hardware";
        })()
      `,
    });
    await sleep(3500);
    await capture("admin_hardware_page.png");

    console.log("All views captured successfully!");
    ws.close();
  } catch (err) {
    console.error("CDP error:", err);
  } finally {
    chromeProcess.kill();
  }
}

run();
