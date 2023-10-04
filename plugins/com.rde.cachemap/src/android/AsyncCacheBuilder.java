import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.AsyncTask;
import android.provider.MediaStore;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;


import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;


/**
 * Created by roch DARDIE on 22/04/15.
 */
public class AsyncCacheBuilder extends AsyncTask {
    private Context myContext;
    private CacheDescriptor caDe;
    private DownloadManager dm;
    private CacheDescriptor caDeLocal;
    Pyromaniac flamethrower;

    private final String DM_FIX = "-t";

    //constructeur
    public AsyncCacheBuilder(Context context, Pyromaniac eventTrigger , CacheDescriptor c,DownloadManager d )
    {

        this.myContext = context ;
        this.caDe=c;
        this.dm =d;
        this.caDeLocal=null;
        this.flamethrower = eventTrigger;
    }





    // Méthode exécutée au début de l'execution de la tâche asynchrone
    @Override
    protected void onPreExecute() {
        super.onPreExecute();
    }




    //@Override
    protected void onProgressUpdate(Integer... values){
        super.onProgressUpdate(values);

//        // Mise à jour de la ProgressBar
//
//        this.mProgressBar.setProgress(values[0]);
    }






    @SuppressLint("NewApi")
    @Override
    protected Object doInBackground(Object... params) {

        Log.d("PluginRDE_RUN","asyncTask");


        Log.d("PluginRDE","descripteur de cache actif : "+this.caDe.toString());


        this.onProgressUpdate(0);

        /***
         *  Todo verification de l'existance du cache ds le .json du nom
         *  Todo Comparaison des emprise si existant
         *  Todo si Nouveau plus vaste alors rechargé la partie manquante
         *
         *
         */





        try {
//            InputStream instream = new FileInputStream(myContext.getExternalFilesDir( "Tile").getPath()+"/"+this.caDe.getSource() +"_"+ this.caDe.getNom()+".json");
            File f = new File(myContext.getExternalFilesDir("tiles").getPath() + "/" + this.caDe.getName() + "/de.json");


// if file the available for reading
//            if (instream != null) {
//                // prepare the file for reading
//                InputStreamReader inputreader = new InputStreamReader(instream);
//                BufferedReader buffreader = new BufferedReader(inputreader);
//
//                String line="";
//
//                // read every line of the file into the line-variable, on line at the time
//                do {
//                    line = line +" " +buffreader.readLine();
//                    // do something with the line
//                } while (line != null);
//
//                Log.d("PluginRDE_Json","String in Json File : "+line);

            Log.d("PluginRDE_DEBUG","CADE FILE"+FileUtils.FiletoString(f));
            Log.d("PluginRDE_DEBUG","CADE JSONOBJ"+new JSONObject(FileUtils.FiletoString(f)).toString());

            if(f!= null){
                this.caDeLocal = new CacheDescriptor( new JSONObject(FileUtils.FiletoString(f)));
                Log.d("PluginRDE_DEBUG","CADE OBJ"+this.caDeLocal.toString());
            }


//                }

//            instream.close();

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }







        this.onProgressUpdate(20);


/***
 *TODO un repartiteur pour mutualisé la gestion des type
 */




        //chargement des tuiles si inexistant
        if(caDeLocal == null){
            Log.d("PluginRDE_DEBUG","CREATETILE");
//                this.aTileDownload( this.caDe.firstLvlTileFromBb_TMS());

            for(int i=0; i <= this.caDe.getzMax() ; i++){
                Log.d("NN","BOUCLETTE : " +i);
//                Log.d("NN","BOUCLE : " +this.caDe.getaTileFromZoomLvl_TMS(i).toString());
                for(Tile t  :this.caDe.getaTileFromZoomLvl_TMS(i)){
                    this.launchTileDl(t);
                }
            }


        }
        //Cas d'une mise a jour :
        if(! (caDeLocal==null) && (! caDeLocal.equals(caDe))){

            /**
             * TODO comment on gere la fraicheur des donnée?
             */

//                this.aTileDownload( caDeLocal.getDiff(caDe)); //recupere les tuiles et leur sous tuile non encore presente

        }




        //Ecriture des metaData Du cache
        if( caDeLocal == null ||  ! caDe.equals(caDeLocal))
        {

            /**
             * TODO ecriture du cache descriptor dans un fichier json.
             * Todo nomDeLaSource_NomDuCache.json
             *
             * TODO : NOTE : nom => source => id ??
             *
             */


            Gson gson = new Gson();

            // convert java object to JSON format,
            // and returned as JSON formatted string

            String json = gson.toJson(this.caDe);


            FileWriter file = null;
            try {
                File fi = new File(myContext.getExternalFilesDir("tiles").getPath() + "/" + this.caDe.getName() + ".json");

                Log.d("PluginRDE_Json", fi.getPath());

                file = new FileWriter(fi);
                file.write(gson.toJson(this.caDe));
                file.close();

            } catch (IOException e) {
                e.printStackTrace();
            }


            Log.d("PluginRDE_Json",json);



        }

        //diffusion des changement
        FileUtils.broadCastCacheList( this.myContext,this.flamethrower);


        this.onProgressUpdate(100);
        return null;

    }


    // Méthode exécutée à la fin de l'execution de la tâche asynchrone

    @Override
    protected void onPostExecute(Object result) {

        super.onPostExecute(result);

        //ToDo renvoyer un event pour informer l'ui de la disponibilité d'un cache


    }


    private void aTileDownload(ArrayList<Tile> aTile){
//        Log.d("PluginRDE_RUN", "downloadTile" + aTile);

//        if(aTile.get(0).getZ()<= caDe.getzMax())

        for(Tile t  :aTile){
//            Log.d("PluginRDE_debug_DL", "tile en cours de DL : "+t.toString());

            this.launchTileDl(t);

            //recur : sur la sous tuile
            if(t.getZ()> caDe.getzMin()) {
                aTileDownload(t.subServientTile_TMS());
            }
//            Log.d("PluginRDE_DEBUG_DLT", t.toString());
        }
    }



    public long launchTileDl(Tile t) {
//        Log.d("PluginRDE_DLT", "downloadTile");



        //TODO methode get url dans tile @param type
        DownloadManager.Request request =null;
//        //Gestion des requete par source
//        if(this.caDe.getTypeSource().equals("OSM")){
////            DownloadManager.Request request = new DownloadManager.Request( Uri.parse(this.caDe.getUrlSource() +"/"+t.getTMSsampleReq()));
//
//        }
//
//
//        if(this.caDe.getTypeSource().equals("ImageWMS")){
//
//
//
//
////            DownloadManager.Request request = new DownloadManager.Request( Uri.parse(this.caDe.getUrlSource() +"/"+t.getTMSsampleReq()));
////            Log.d("PluginRDE","http://a.tile.openstreetmap.org" + "/" + t.getZ() + "/" + t.getX() + "/" + t.getY() + ".png");
//        }
//        Log.d("PluginRDE_DLT", this.caDe.getTypeSource().toString());

        switch(this.caDe.getTypeSource()){
            case OSM:
                Log.d("PluginRDE_TEST",  Uri.parse(this.caDe.getUrlSource() +"/"+t.getTMSsampleReq()).toString());



                 request = new DownloadManager.Request( Uri.parse(this.caDe.getUrlSource() +"/"+t.getTMSsampleReq()));
//                    Log.d("PluginRDE", "http://a.tile.openstreetmap.org" + "/" + t.getZ() + "/" + t.getX() + "/" + t.getY() + ".png");
//                     request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);
                //        request.setAllowedOverRoaming(false);

                request.setDescription("MiseAJourDuCache");
//                request.setDestinationInExternalFilesDir(myContext, this.caDe.getDirPath() + t.getZ() + "/" + t.getX() + "/", t.getY() + ".png");

                this.putLocalPathInRequest(request,t);

                //suppression annulation ?

                request.setMimeType("application/octet-stream");
//                request.setMimeType("image/png");
                request.setTitle(t.getTMSsampleReq());

                return dm.enqueue(request);


//                break;
            case ImageWMS :
//                Log.d("PluginRDE_DLT", "WMS CASE");
//                    Log.d("PluginRDE_BBOX","BBox coordinate : "+t.getBoundingBox("unUse").toString());
//                    Log.d("PluginRDE_BBOX","BBox projeté : "+t.getBoundingBox("unUse").toESPG3857().toString());


                Log.d("PluginRDE_TEST",  Uri.parse(this.caDe.getUrlSource()+caDe.getWMSdescriptor()+t.getWMSsampleReq()).toString());

                    request = new DownloadManager.Request( Uri.parse(this.caDe.getUrlSource()+caDe.getWMSdescriptor()+t.getWMSsampleReq()));
//                Log.d("PluginRDE_DLT", "req   ====> " + this.caDe.getUrlSource() + caDe.getWMSdescriptor()+t.getWMSsampleReq());

                request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);
                    //        request.setAllowedOverRoaming(false);

                request.setDescription("MiseAJourDuCache");

//                    request.setDestinationInExternalFilesDir(myContext, this.caDe.getDirPath() + t.getZ() + "/" + t.getX()+"/" , t.getY()+".png");

                    this.putLocalPathInRequest(request,t);

                    return dm.enqueue(request);
//                break;
            default:
                Log.d("PluginRDE_DLT", "DEFAULT CASE");
                break;
        }

                //Restrict the types of networks over which this download may proceed.

                //FIXME sleep on it
//                if (request ){
//
//                }


        Log.d("PluginRDE", "END DL");
        return 0l;
    }



    private void putLocalPathInRequest(DownloadManager.Request r, Tile t){

        r.setDestinationInExternalFilesDir(myContext, this.caDe.getDirPath() + t.getZ() + "/" + t.getX()+"/" , t.getY()+".png"+DM_FIX);
//        r.setDestinationInExternalFilesDir(myContext, this.caDe.getDirPath() + t.getZ() + "/" + t.getX()+"/" , t.getY()+".png");

//        return r;
    }






   }
