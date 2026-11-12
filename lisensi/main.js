// Pembuat Lisensi Catat Toko (khusus penjual, Windows).
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

if (!app.requestSingleInstanceLock()) app.quit();

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 420,
    minHeight: 520,
    title: "Pembuat Lisensi Catat Toko",
    backgroundColor: "#F3F6F5",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "app", "index.html"));

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

app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
