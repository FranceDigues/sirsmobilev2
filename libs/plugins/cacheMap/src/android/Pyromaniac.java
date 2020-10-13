import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONObject;

import android.util.Log;

/**
 * Created by roch DARDIE on 06/05/15.
 */
public class Pyromaniac {

    private CallbackContext CacheCallbackContext = null;


    public Pyromaniac(CallbackContext cbc) {
        this.CacheCallbackContext = cbc;
    }

    public void fire(JSONObject info, boolean keepCallback) {
        Log.d("PluginRDE_PYRO","fireEvent");
        if (this.CacheCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, info);
            result.setKeepCallback(keepCallback);
            Log.d("PluginRDE_PYRO", "result");
//            Log.d("PluginRDE_PYRO", result);
            this.CacheCallbackContext.sendPluginResult(result);
        }
    }

    public void fire(JSONObject info) {
       this.fire(info, true);
    }


}
