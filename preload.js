// Jembatan aman antara halaman aplikasi dan fitur cetak Windows.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("catatDesktop", {
  printers: () => ipcRenderer.invoke("ct:printers"),
  print: (opts) => ipcRenderer.invoke("ct:print", opts)
});
