package id.balitsolutions.catattoko;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CatatPrintPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
