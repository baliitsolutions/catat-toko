// Jendela aplikasi Windows (Electron) untuk Catat Toko.
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

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
      spellcheck: false
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

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
