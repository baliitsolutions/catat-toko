// Jendela aplikasi Windows (Electron) untuk Catat Toko.
const { app, BrowserWindow, shell, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Satu aplikasi saja yang boleh terbuka, supaya data tidak bentrok.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 380,
    minHeight: 560,
    title: "Catat Toko",
    backgroundColor: "#F2F6F4",
    icon: path.join(__dirname, "assets", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "www", "index.html"));

  // Link WhatsApp & web lain dibuka di browser / aplikasi bawaan Windows.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) {
      e.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
}

// ---------- Cetak ----------
ipcMain.handle("ct:printers", async (e) => {
  const list = await e.sender.getPrintersAsync();
  return list.map((p) => ({ name: p.name, displayName: p.displayName || p.name, isDefault: !!p.isDefault }));
});

// opts: { html, deviceName, silent, paper: { kind: "page"|"roll", widthMm, heightMm } }
ipcMain.handle("ct:print", async (_e, opts) => {
  const paper = (opts && opts.paper) || { kind: "page", widthMm: 210, heightMm: 297 };
  const w = new BrowserWindow({ show: false, width: 900, height: 1200, webPreferences: { sandbox: true, contextIsolation: true } });
  try {
    await w.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(opts.html || ""));
    let heightMm = paper.heightMm;
    if (paper.kind === "roll") {
      const px = await w.webContents.executeJavaScript("Math.ceil(document.documentElement.scrollHeight)");
      heightMm = Math.max(paper.widthMm, Math.ceil(px * 25.4 / 96) + 8);
    }
    const options = {
      silent: !!(opts.silent && opts.deviceName),
      deviceName: opts.deviceName || undefined,
      printBackground: true,
      margins: { marginType: "none" },
      pageSize: { width: Math.round(paper.widthMm * 1000), height: Math.round(heightMm * 1000) }
    };
    return await new Promise((resolve) => {
      w.webContents.print(options, (ok, reason) => resolve({ ok, reason: reason || "" }));
    });
  } catch (err) {
    return { ok: false, reason: String((err && err.message) || err) };
  } finally {
    setTimeout(() => { if (!w.isDestroyed()) w.close(); }, 500);
  }
});

// ---------- Cadangan otomatis ----------
function backupDir() { return path.join(app.getPath("documents"), "CatatToko", "Cadangan"); }
ipcMain.handle("ct:autoBackup", async (_e, { name, json }) => {
  try {
    const dir = backupDir();
    fs.mkdirSync(dir, { recursive: true });
    const safe = String(name || "cadangan.json").replace(/[^a-zA-Z0-9._-]/g, "_");
    fs.writeFileSync(path.join(dir, safe), String(json || ""), "utf8");
    const files = fs.readdirSync(dir).filter((f) => /^cadangan-otomatis-.*\.json$/.test(f)).sort();
    for (const f of files.slice(0, Math.max(0, files.length - 30))) fs.unlinkSync(path.join(dir, f));
    return { ok: true, dir };
  } catch (err) {
    return { ok: false, reason: String((err && err.message) || err) };
  }
});
ipcMain.handle("ct:openBackupDir", async () => {
  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true });
  await shell.openPath(dir);
  return dir;
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
