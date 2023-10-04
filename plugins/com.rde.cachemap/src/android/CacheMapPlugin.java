/**
 * Created by roch dardie on 17/04/15.
 */



import android.app.DownloadManager;
import android.app.DownloadManager.Request;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
//import android.database.Cursor;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;


import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;

import android.os.ParcelFileDescriptor;
import android.util.Log;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;


/**
 *
 * TODO :  test unitaire.,?
 *
 * TODO gestion des multi polygone
 *
 * TODO gestion WMS et autre
 *
 * TODO : ecrire la partie du rapport attenante + layus energie.
 *
 * TODO : profilage du systeme, et comparaison avec JS
 *
 * TODO test de fonctionement du systeme actuel
 *
 *
 *
 *
 *
 *
 * **/



public class CacheMapPlugin extends CordovaPlugin {
    public static final String TAG = "Cache Map Plugin";


    private int percent; //0-100
    private long enqueue;  //do Tableau
    private DownloadManager dm;
    private DownloadReceiver dr;

    private String StorageDrive;
    private Pyromaniac flamethrower;


    /**
     * Constructor.
     */
    public CacheMapPlugin() {

    }
    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        Log.v(TAG,"Init CacheMapPlugin");
    }
    public boolean execute( String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        this.dm = (DownloadManager) this.cordova.getActivity().getSystemService(Context.DOWNLOAD_SERVICE);
//        this.StorageDrive = "file:///storage/emulated/0/Android/data/com.ionic.Map03/cache/OSM/essai/";
//        this.StorageDrive = "file://storage/emulated/0/Android/data/com.ionic.Map03/cache/OSM/essai/";
        //recuperé le stokage de cordova? moche..
//        StorageDrive =args[1];
        Log.d("PluginRDE","PlugCall");



        this.registerDr();


        //construction de l'emetteur d'evenement :
        this.flamethrower = new Pyromaniac(callbackContext);


        if( action.equals("updateCache") )
        {
            Log.d("PluginRDE_RUN","updateCacheWay");
            Log.d("PluginRDE","parametre 0 : "+args.getJSONObject(0).toString());
            this.runToast("Mise à jour de cache :");

            /**
             * TODO for each cache desciptor  run build Cache
             *
             * TODO une seule fonction sufit?
             *
             * TODO : introduire une fonction d'interogation des calque dispo par lecture des .json
             * présent dans tile
             * */


            this.buildCache(args.getJSONObject(0));

//            this.downloadTile("testUUID", "TestNom", 0,0, 0);

        }

        if( action.equals("clearOne") )
        {
            Log.d("PluginRDE", "clear CadeList");
            //TODO clear juste le cache en parametre
            this.runToast("Suppression de cache :");


                for(int i = 0 ; i<args.length();i++){

                AsyncClear threadClear = new AsyncClear(this.cordova.getActivity(),this.flamethrower,args.getJSONObject(i));

                    threadClear.execute();

            }


        }
        if( action.equals("clearAll") )
        {
            Log.d("PluginRDE", "initUserData");
            //TODO clear juste le cache en parametre
            this.runToast("Suppression de tous les cache :");

                AsyncClear threadClear = new AsyncClear(this.cordova.getActivity(),this.flamethrower,true);

                    threadClear.execute();
        }

        //gestion du receiver by js ??
        if( action.equals("registerReceiver") )
        {
            this.registerDr();
        }
        if( action.equals("unregisterReceiver") )
        {
            this.unRegisterDr();
        }



//getSource
        if( action.equals("getCaDeList") )

    {
        Log.d("PluginRDE", "getCaDeList");
        //TODO clear juste le cache en parametre
        this.runToast("Recuperation de la liste des caches :");




        FileUtils.broadCastCacheList(this.cordova.getActivity(),this.flamethrower);




    }


        return true;
    };

//FIXME vider cette classe, et integrer la creation des Cade dans les asyncTask.






    //Methode
    private void runToast(final String a ){
        Log.d("PluginRDE_RUN","toast");
        final int duration = Toast.LENGTH_SHORT;
// Shows a toast
//        Log.v(TAG,"CacheMapPlugin received:"+ action);
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                Toast toast = Toast.makeText(cordova.getActivity().getApplicationContext(), a, duration);
                toast.show();


            }
        });

    }


    public void registerDr(){
        dr = new DownloadReceiver();
        this.cordova.getActivity().registerReceiver(dr, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
    }
    public void unRegisterDr(){
        this.cordova.getActivity().unregisterReceiver(dr);
    }




    private boolean buildCache(JSONObject jsonCache){
        Log.d("PluginRDE_RUN","buildCache");


        //FIXME vider cette classe, et integrer la creation des Cade dans les asyncTask.
//construction de l'objet java depuis le json
         CacheDescriptor caDes = new CacheDescriptor(jsonCache);



        //creation et lancement async task


        Log.d("PluginRDE_DEBUG","buildCache + "+caDes.toString());
            AsyncCacheBuilder asyncCbuilder = new AsyncCacheBuilder(this.cordova.getActivity(),this.flamethrower,caDes, this.dm);

        asyncCbuilder.execute();













return true;
    }



    private void initDlReceiver(){
        Log.d("PluginRDE_RUN","dlReceiver");
        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(action)) {
                    long downloadId = intent.getLongExtra(
                            DownloadManager.EXTRA_DOWNLOAD_ID, 0);


                }
            }
        };

//        registerReceiver(receiver, new IntentFilter(
//                DownloadManager.ACTION_DOWNLOAD_COMPLETE));
    }




//private void initBroadCastReceiver() {
//    File f = new File();
//    f.renameTo()
//
//
//    private BroadcastReceiver receiver = new BroadcastReceiver() {
//        @Override
//        public void onReceive(Context context, Intent intent) {
//            queryDownloadStatus();
//        }
//    };
//
//    private void queryDownloadStatus() {
//        DownloadManager.Query query = new DownloadManager.Query();
//        query.setFilterById(prefs.getLong(DL_ID, 0));
//        Cursor c = dm.query(query);
//        if (c.moveToFirst()) {
//            int status = c.getInt(c.getColumnIndex(DownloadManager.COLUMN_STATUS));
//            Log.d("DM Sample", "Status Check: " + status);
//            switch (status) {
////                case DownloadManager.STATUS_PAUSED:
////                case DownloadManager.STATUS_PENDING:
////                case DownloadManager.STATUS_RUNNING:
////                    break;
//                case DownloadManager.STATUS_SUCCESSFUL:
//                    try {
//                        ParcelFileDescriptor file = dm.openDownloadedFile(prefs.getLong(DL_ID, 0));
//                        FileInputStream fis = new ParcelFileDescriptor.AutoCloseInputStream(file);
//                        imageView.setImageBitmap(BitmapFactory.decodeStream(fis));
//                    } catch (Exception e) {
//                        e.printStackTrace();
//                    }
//                    break;
//                case DownloadManager.STATUS_FAILED:
//                    dm.remove(prefs.getLong(DL_ID, 0));
//                    prefs.edit().clear().commit();
//                    break;
//            }
//        }
//    }
//
//}

}
