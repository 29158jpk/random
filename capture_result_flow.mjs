import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:/Users/Horizon/.gemini/antigravity-ide/brain/3e42fd0a-3e82-42a0-8f51-f57040fdbced";
const TEMP_USER_DATA = "C:/Users/Horizon/AppData/Local/Temp/chrome_result_flow";

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

    // 1. Set member in localStorage and reload
    console.log("Setting member session in localStorage...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const memberUser = {
            id: "member-test-01",
            email: "player@horizon.pc",
            role: "authenticated",
            user_metadata: { username: "HorizonGamer" }
          };
          const memberSession = {
            access_token: "horizon_token_member_12345",
            user: memberUser
          };
          localStorage.setItem("horizon_local_session", JSON.stringify(memberSession));
          localStorage.setItem("horizon_local_users", JSON.stringify([{
            id: "member-test-01",
            email: "player@horizon.pc",
            passwordHash: "dummy",
            username: "HorizonGamer",
            role: "user",
            status: "active",
            created_at: new Date().toISOString()
          }]));
        })()
      `,
    });

    console.log("Navigating to http://localhost:3000 as authenticated user...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await sleep(3000);

    // 2. Click Random PC button
    console.log("Clicking Random PC button...");
    const clickRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const spinBtn = btns.find(b => b.innerText.includes('RANDOM PC'));
          if (spinBtn) {
            spinBtn.click();
            return { clicked: true, text: spinBtn.innerText };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true,
    });
    console.log("Click result:", clickRes.result?.value);

    // Wait for slot animation & result popup (slot animation runs ~3s)
    console.log("Waiting for slot animation and PCResultModal...");
    await sleep(4000);

    // Capture PC Result Modal
    const resResult = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "pc_result_modal.png"), Buffer.from(resResult.data, "base64"));
    console.log("Saved pc_result_modal.png!");

    // 3. Click hardware card to open HardwareDetailModal
    console.log("Clicking GPU / CPU card in result modal...");
    const clickCard = await send("Runtime.evaluate", {
      expression: `
        (() => {
          // Look for component cards inside the modal
          const cards = Array.from(document.querySelectorAll('.group.glass-panel'));
          if (cards.length > 0) {
            cards[0].click();
            return { clickedCard: true, text: cards[0].innerText.slice(0, 50) };
          }
          // Fallback: any element with 'Details'
          const detailBtn = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText?.trim() === 'Details');
          if (detailBtn) {
            detailBtn.click();
            return { clickedCard: true, fallback: true };
          }
          return { clickedCard: false, count: cards.length };
        })()
      `,
      returnByValue: true,
    });
    console.log("Click card result:", clickCard.result?.value);

    await sleep(1500);

    // Capture Hardware Detail Modal
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
