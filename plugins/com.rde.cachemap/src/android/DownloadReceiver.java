import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.util.Log;

import java.io.File;

/**
 * Created by roch DARDIE on 22/05/15.
 */

public class DownloadReceiver extends BroadcastReceiver {
    public DownloadReceiver() {
        Log.d("PluginRDE_DLM", "build DLM ");
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(action)) {
//            Log.d("PluginRDE_DLM", "DLM ACTION COMPLETTE ");

            long downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, 0);
            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(downloadId);
            DownloadManager mDownloadManager =
                    (DownloadManager)context.getSystemService(Context.DOWNLOAD_SERVICE);
            Cursor c = mDownloadManager.query(query);
            if (c.moveToFirst()) {
                int columnIndex = c
                        .getColumnIndex(DownloadManager.COLUMN_STATUS);

                //if completed successfully
                if (DownloadManager.STATUS_SUCCESSFUL == c.getInt(columnIndex)){
//                    Log.d("PluginRDE_DLM", "DLM DL SUCCESS ");
//                    Log.d("PluginRDE_DLM", "DLM DL URI FILE : " + c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)));
                    String uri = c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI));
                    //check if this is your download uri
                    if (!uri.contains("files/tiles"))  return;

                    //here you get file path so you can move
                    //it to other location if you want

                    //RENAME
//                    String downloadedPackageUriString = c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_FILENAME));
                    String downloadedPackageUriString = (c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI))).replace("file://","");

                    File tmp = new File(downloadedPackageUriString);
                    File ok = new File(downloadedPackageUriString.substring(0, downloadedPackageUriString.length() - 2));

                    tmp.renameTo(ok);

                    mDownloadManager.remove(downloadId);


//                    Log.d("PluginRDE_DLM", "filepath : "+downloadedPackageUriString);


                }else if ( DownloadManager.STATUS_FAILED == c.getInt(columnIndex)){
                    //supression de l'entrée dan le dlm?

                }
            }

            c.close();
        }
    }
}