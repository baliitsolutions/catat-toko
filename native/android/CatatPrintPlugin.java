package id.balitsolutions.catattoko;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.util.Base64;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

/**
 * Cetak untuk Catat Toko:
 *  - listBluetooth / printBluetooth : printer thermal Bluetooth (ESC/POS lewat SPP)
 *  - printHtml                      : dokumen A4 / continuous lewat layanan cetak Android
 */
@CapacitorPlugin(
    name = "CatatPrint",
    permissions = { @Permission(alias = "bluetooth", strings = { Manifest.permission.BLUETOOTH_CONNECT }) }
)
public class CatatPrintPlugin extends Plugin {

    private static final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private WebView printView; // disimpan supaya tidak dibersihkan sebelum selesai cetak

    private boolean needsBtPermission() {
        return Build.VERSION.SDK_INT >= 31 && getPermissionState("bluetooth") != PermissionState.GRANTED;
    }

    @PluginMethod
    public void listBluetooth(PluginCall call) {
        if (needsBtPermission()) { requestPermissionForAlias("bluetooth", call, "btPermCallback"); return; }
        doList(call);
    }

    @PluginMethod
    public void printBluetooth(PluginCall call) {
        if (needsBtPermission()) { requestPermissionForAlias("bluetooth", call, "btPermCallback"); return; }
        doPrint(call);
    }

    @PermissionCallback
    private void btPermCallback(PluginCall call) {
        if (needsBtPermission()) { call.reject("Izin Bluetooth ditolak. Izinkan di Setelan aplikasi.", "denied"); return; }
        if ("listBluetooth".equals(call.getMethodName())) doList(call); else doPrint(call);
    }

    @SuppressWarnings("MissingPermission")
    private void doList(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) { call.reject("HP ini tidak punya Bluetooth.", "no_bt"); return; }
        if (!adapter.isEnabled()) { call.reject("Bluetooth belum dinyalakan.", "bt_off"); return; }
        JSArray arr = new JSArray();
        Set<BluetoothDevice> bonded = adapter.getBondedDevices();
        if (bonded != null) {
            for (BluetoothDevice d : bonded) {
                JSObject o = new JSObject();
                o.put("name", d.getName() == null ? d.getAddress() : d.getName());
                o.put("address", d.getAddress());
                arr.put(o);
            }
        }
        JSObject res = new JSObject();
        res.put("devices", arr);
        call.resolve(res);
    }

    @SuppressWarnings("MissingPermission")
    private void doPrint(PluginCall call) {
        final String address = call.getString("address");
        final String b64 = call.getString("data");
        if (address == null || b64 == null) { call.reject("Printer atau data kosong.", "bad_args"); return; }
        final byte[] data = Base64.decode(b64, Base64.DEFAULT);
        new Thread(() -> {
            BluetoothSocket socket = null;
            try {
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                if (adapter == null || !adapter.isEnabled()) { call.reject("Bluetooth belum dinyalakan.", "bt_off"); return; }
                adapter.cancelDiscovery();
                BluetoothDevice device = adapter.getRemoteDevice(address);
                socket = device.createRfcommSocketToServiceRecord(SPP);
                socket.connect();
                OutputStream os = socket.getOutputStream();
                int chunk = 512;
                for (int i = 0; i < data.length; i += chunk) {
                    os.write(data, i, Math.min(chunk, data.length - i));
                    os.flush();
                    Thread.sleep(20);
                }
                Thread.sleep(700);
                call.resolve();
            } catch (Exception e) {
                call.reject("Gagal mencetak. Pastikan printer menyala dan sudah dipasangkan (pair). " + e.getMessage(), "print_failed");
            } finally {
                if (socket != null) { try { socket.close(); } catch (IOException ignored) { } }
            }
        }).start();
    }

    @PluginMethod
    public void printHtml(PluginCall call) {
        final String html = call.getString("html", "");
        final String name = call.getString("name", "Catat Toko");
        final String size = call.getString("size", "a4");
        getActivity().runOnUiThread(() -> {
            WebView wv = new WebView(getContext());
            wv.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    PrintManager pm = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                    PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(name);
                    PrintAttributes.Builder b = new PrintAttributes.Builder();
                    b.setMediaSize(mediaFor(size));
                    b.setMinMargins(PrintAttributes.Margins.NO_MARGINS);
                    pm.print(name, adapter, b.build());
                    call.resolve();
                }
            });
            printView = wv;
            wv.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
        });
    }

    private PrintAttributes.MediaSize mediaFor(String size) {
        switch (size) {
            case "cf":   return new PrintAttributes.MediaSize("CT_CF_FULL", "Continuous 9.5 x 11 in", 9500, 11000);
            case "cf2":  return new PrintAttributes.MediaSize("CT_CF_HALF", "Continuous 9.5 x 5.5 in", 9500, 5500);
            case "a5":   return PrintAttributes.MediaSize.ISO_A5;
            default:     return PrintAttributes.MediaSize.ISO_A4;
        }
    }
}
