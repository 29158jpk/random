import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_test_spin";

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

    ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      if (data.method === "Runtime.consoleAPICalled") {
        console.log("[Console]", data.params.args.map((a) => a.value || a.description).join(" "));
      }
    });

    await send("Page.enable");
    await send("Runtime.enable");

    // 1. Set member session in localStorage
    console.log("Setting member session...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(2500);

    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const memberUser = {
            id: "gamer-101",
            email: "horizon_gamer@pc.th",
            role: "authenticated",
            user_metadata: { username: "HorizonMaster" }
          };
          const memberSession = {
            access_token: "horizon_mock_token_123",
            user: memberUser
          };
          localStorage.setItem("horizon_local_session", JSON.stringify(memberSession));
          localStorage.setItem("horizon_local_users", JSON.stringify([{
            id: "gamer-101",
            email: "horizon_gamer@pc.th",
            passwordHash: "dummy",
            username: "HorizonMaster",
            role: "user",
            status: "active",
            created_at: new Date().toISOString()
          }]));
        })()
      `,
    });

    // Reload so AuthContext picks up the session
    console.log("Reloading as authenticated member...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(3000);

    // 2. Click the spin button inside #random-engine
    console.log("Clicking spin button inside #random-engine...");
    const spinClick = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const container = document.getElementById('random-engine');
          if (!container) return { found: false, msg: "No #random-engine" };
          const btn = Array.from(container.querySelectorAll('button')).find(b => b.innerText.includes('RANDOM PC'));
          if (btn) {
            btn.click();
            return { found: true, text: btn.innerText };
          }
          return { found: false, msg: "Button not found in container" };
        })()
      `,
      returnByValue: true,
    });
    console.log("Spin button click result:", spinClick.result?.value);

    // Wait for slot animation to complete (1.8s) + result modal popup (0.5s) = ~3s
    await sleep(3500);

    // Check DOM for result modal
    const resultCheck = await send("Runtime.evaluate", {
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
    console.log("Result Modal Check:", resultCheck.result?.value);

    // Capture screenshot of PC Result Modal!
    const resResult = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "pc_result_modal.png"), Buffer.from(resResult.data, "base64"));
    console.log("Saved pc_result_modal.png!");

    // 3. Click one of the 8 Hardware Cards to open HardwareDetailModal
    console.log("Clicking hardware card...");
    const clickCard = await send("Runtime.evaluate", {
      expression: `
        (() => {
          // Find hardware card inside modal
          const cards = Array.from(document.querySelectorAll('.group.glass-panel.rounded-2xl'));
          if (cards.length > 0) {
            cards[0].click();
            return { clickedCard: true, cardName: cards[0].querySelector('h4')?.innerText };
          }
          return { clickedCard: false, count: cards.length };
        })()
      `,
      returnByValue: true,
    });
    console.log("Card click result:", clickCard.result?.value);

    await sleep(1500);

    // Check Hardware Detail Modal DOM
    const detailCheck = await send("Runtime.evaluate", {
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
    console.log("Detail Modal Check:", detailCheck.result?.value);

    // Capture screenshot of Hardware Detail Modal!
    const resDetail = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "hardware_detail_modal.png"), Buffer.from(resDetail.data, "base64"));
    console.log("Saved hardware_detail_modal.png!");

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProcess.kill();
  }
}

run();
