import android.content.Context;
import android.util.Log;

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
 * Created by harksin on 11/05/15.
 */
public class FileUtils {

    public static String FiletoString(File f) throws IOException, JSONException {

        InputStream instream = new FileInputStream(f);

        InputStreamReader inputreader = new InputStreamReader(instream);
        BufferedReader buffreader = new BufferedReader(inputreader);


//                IOUtils.readLines  ??
//

        StringBuilder total = new StringBuilder();
        String line;
        while ((line = buffreader.readLine()) != null) {
            total.append(line);
        }

//clear.
        instream.close();
        buffreader.close();



        return total.toString();

    };

    public static String pathFiletoString(String f){

        return "";
    };


public static void broadCastCacheList(Context c, Pyromaniac flamethrower){

    try {

    File[] jsonList =c.getExternalFilesDir("tiles").listFiles(new FileFilter() {
        @Override
        public boolean accept(File pathname) {
            return pathname.getName().endsWith(".json");
        }
    });

    JSONArray aCaDe = new JSONArray();
    for (File f : jsonList) {

            //stack json Object

            aCaDe.put(new JSONObject(FileUtils.FiletoString(f)));

    }

    //preparation du message contenant les descripteur de caches
    JSONObject eventMessage = new JSONObject("{\"evType\":\"updateListCache\",\"aCade\":\"null\"}");
    eventMessage.put("aCaDe", aCaDe);

    //envoie du message par lanceflame interposé
    flamethrower.fire(eventMessage);

    } catch (FileNotFoundException e) {
        e.printStackTrace();
    } catch (JSONException e) {
        e.printStackTrace();
    } catch (IOException e) {
        e.printStackTrace();
    }


    }



    public static long getFolderSize(File dir) {
        long size = 0;
        for (File file : dir.listFiles()) {
            if (file.isFile()) {
                System.out.println(file.getName() + " " + file.length());
                size += file.length();
            }
            else
                size += getFolderSize(file);
        }
        return size;
    }

}
