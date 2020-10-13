import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by roch DARDIE on 22/04/15.
 */

//TODO ! pHd, pBg == > MIN MAX
public class CacheDescriptor {

    private String name;
    private String layerSource;
    private sourceType typeSource;
    private String urlSource;
    private String shortUrlSource;

    private ArrayList<String> layers;

    private int zMin;
    private int zMax;

    private GeoPoint pHg;
    private GeoPoint pBd;

    private String path;


    public CacheDescriptor() {
        this.path = "";
        this.layers = new ArrayList<String>();
        this.shortUrlSource = "";

    }

    public CacheDescriptor(JSONObject jsonCache) {
        this.shortUrlSource = "";
        this.path = "";
        this.layers = new ArrayList<String>();

        try {
            this.setName(jsonCache.getString("name"));
            this.setLayerSource(jsonCache.getString("layerSource"));
            this.setTypeSource(sourceType.valueOf(jsonCache.getString("typeSource")));
            this.setUrlSource(jsonCache.getString("urlSource"));
            this.setzMin(jsonCache.getInt("zMin"));
            this.setzMax(jsonCache.getInt("zMax"));


            //FIXME stop stoker des point dans un array sale
            if (jsonCache.has("bbox")) { //BBOX prend le pas

                JSONArray aBbox = jsonCache.getJSONArray("bbox");

                GeoPoint tmpMin = new GeoPoint(aBbox.getJSONArray(0).getDouble(0), aBbox.getJSONArray(0).getDouble(1));
                GeoPoint tmpMax = new GeoPoint(aBbox.getJSONArray(1).getDouble(0), aBbox.getJSONArray(1).getDouble(1));
                tmpMin.maxwell(tmpMax);

                this.setpHg(tmpMin);
                this.setpBd(tmpMax);


            }
            if (jsonCache.has("pHg") && jsonCache.has("pBd")) { //BBOX prend le pas

                this.setpHg(new GeoPoint(jsonCache.getJSONObject("pHg")));
                this.setpBd(new GeoPoint(jsonCache.getJSONObject("pBd")));


            }


            if (this.getTypeSource() == sourceType.ImageWMS) {
                JSONArray aLayers = jsonCache.getJSONArray("layers");
                for (int i = 0; i < aLayers.length(); i++) {
                    this.layers.add(aLayers.getString(i));
                }
            }


        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GeoPoint getpHg() {
        return pHg;
    }

    public void setpHg(GeoPoint pHg) {
        this.pHg = pHg;
    }

    public GeoPoint getpBd() {
        return pBd;
    }

    public void setpBd(GeoPoint pBd) {
        this.pBd = pBd;
    }

    public String getLayerSource() {
        return layerSource;
    }

    public void setLayerSource(String source) {
        layerSource = source;
    }

    public sourceType getTypeSource() {
        return typeSource;
    }

    public void setTypeSource(sourceType typeSource) {
        this.typeSource = typeSource;
    }

    public String getUrlSource() {
        // String to be scanned to find the pattern.
        if (this.shortUrlSource == "") {

            String pattern = ".*\\{([a-z]).[a-z]\\}(.*)\\/\\{z\\}\\/\\{x\\}\\/\\{y\\}.*";

            // Create a Pattern object
            Pattern r = Pattern.compile(pattern);

            // Now create matcher object.
            //TODO cas ou a indisponible??
            Matcher m = r.matcher(this.urlSource);
            if (m.find()) {
                Log.d("REGEX", "http://" + m.group(1) + m.group(2));
                shortUrlSource = "http://" + m.group(1) + m.group(2);
                return "http://" + m.group(1) + m.group(2);
            }else{
                this.shortUrlSource=this.urlSource;
                return this.urlSource;
            }
        }else{
            return this.shortUrlSource;
        }
//        return this.urlSource;
    }

    public void setUrlSource(String urlSource) {
        this.urlSource = urlSource;
    }

    public int getzMin() {
        return zMin;
    }

    public void setzMin(int zMin) {
        this.zMin = zMin;
    }

    public int getzMax() {
        return zMax;
    }

    public void setzMax(int zMax) {
        this.zMax = zMax;
    }

    public ArrayList<String> getLayers() {
        return layers;
    }

    public void setLayers(ArrayList<String> layers) {
        this.layers = layers;
    }

    @Override
    public String toString() {
        return "CacheDescriptor{" +
                "name='" + name + '\'' +
                ", layerSource='" + layerSource + '\'' +
                ", typeSource=" + typeSource +
                ", urlSource='" + urlSource + '\'' +
                ", layers=" + layers +
                ", zMin=" + zMin +
                ", zMax=" + zMax +
                ", pHg=" + pHg +
                ", pBd=" + pBd +
                '}';
    }

//methode



    public ArrayList<Tile> firstLvlTileFromBb_TMS() {


        ArrayList<Tile> aTile = new ArrayList<Tile>();

        Log.d("PluginRDE_debug", "geoPoint Min : " + this.getpHg().toString());
        Log.d("PluginRDE_debug", "geoPoint Max : " + this.getpBd().toString());

        //switch to init from zoom max
        Tile tHg = this.getpHg().toTileTMS(this.getzMax());
        Tile tBd = this.getpBd().toTileTMS(this.getzMax());

        Log.d("PluginRDE_debug", "tile Hg : " + tHg.toString());
        Log.d("PluginRDE_debug", "tile Bd : " + tBd.toString());

        for (int x = tHg.getX(); x <= tBd.getX(); x++) {
            for (int y = tHg.getY(); y <= tBd.getY(); y++) {
                Tile tmp = new Tile(this.getzMax(), x, y);
                Log.d("PluginRDE_debug", "tile en cours : " + tmp.toString());
                aTile.add(tmp);
            }
        }
        return aTile;

    }

public ArrayList<Tile> getaTileFromZoomLvl_TMS(int z) {
    Log.d("NN", "ZZZZ: " + z);

        ArrayList<Tile> aTile = new ArrayList<Tile>();

        Log.d("PluginRDE_debug", "geoPoint Min : " + this.getpHg().toString());
        Log.d("PluginRDE_debug", "geoPoint Max : " + this.getpBd().toString());

        //switch to init from zoom max
        Tile tHg = this.getpHg().toTileTMS(z);
        Tile tBd = this.getpBd().toTileTMS(z);

    Log.d("PluginRDE_debug", "tile Hg : " + tHg.toString());
        Log.d("PluginRDE_debug", "tile Bd : " + tBd.toString());

        for (int x = tHg.getX(); x <= tBd.getX(); x++) {
            for (int y = tHg.getY(); y <= tBd.getY(); y++) {
                Tile tmp = new Tile(z, x, y);
                Log.d("NN", "z en cours : " + z);
                Log.d("NN", "tile en cours : " + tmp.toString());
                aTile.add(tmp);
            }
        }
        return aTile;

    }


    public String getDirPath() {
//        Log.d("PluginRDE_debug", this.path);
        if (this.path == "") {
            this.path = "tiles/" + this.getName() + "/";
        }
//        Log.d("PluginRDE_debug", this.path);
        return this.path;
    }


    //TODO filtre sur les revision uniqement?

    //TODO include layers

//    @Override
//    public boolean equals(Object o) {
//        if (this == o) return true;
//        if (o == null || getClass() != o.getClass()) return false;
//
//        CacheDescriptor that = (CacheDescriptor) o;
//
//        if (zMax != that.zMax) return false;
//        if (zMin != that.zMin) return false;
//        if (layerSource != null ? !layerSource.equals(that.layerSource) : that.layerSource != null) return false;
//        if (name != null ? !name.equals(that.name) : that.name != null) return false;
//        if (pHg != null ? !pHg.equals(that.pHg) : that.pHg != null) return false;
//        if (pBd != null ? !pBd.equals(that.pBd) : that.pBd != null) return false;
//        if (typeSource != null ? !typeSource.equals(that.typeSource) : that.typeSource != null)
//            return false;
//        if (urlSource != null ? !urlSource.equals(that.urlSource) : that.urlSource != null)
//            return false;
//
//        return true;
//    }


    @Override
    public boolean equals(Object o) { //FIXME aLayer non suivi
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CacheDescriptor that = (CacheDescriptor) o;

        if (zMin != that.zMin) return false;
        if (zMax != that.zMax) return false;
        if (name != null ? !name.equals(that.name) : that.name != null) return false;
        if (layerSource != null ? !layerSource.equals(that.layerSource) : that.layerSource != null)
            return false;
        if (typeSource != that.typeSource) return false;
        if (urlSource != null ? !urlSource.equals(that.urlSource) : that.urlSource != null)
            return false;
        if (pHg != null ? !pHg.equals(that.pHg) : that.pHg != null) return false;
        return !(pBd != null ? !pBd.equals(that.pBd) : that.pBd != null);

    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (layerSource != null ? layerSource.hashCode() : 0);
        result = 31 * result + (typeSource != null ? typeSource.hashCode() : 0);
        result = 31 * result + (urlSource != null ? urlSource.hashCode() : 0);
        result = 31 * result + zMin;
        result = 31 * result + zMax;
        result = 31 * result + (pHg != null ? pHg.hashCode() : 0);
        result = 31 * result + (pBd != null ? pBd.hashCode() : 0);
        return result;
    }


    public ArrayList<Tile> getDiff(CacheDescriptor caDeNew) {
        //FIXME include?
        ArrayList<Tile> resultante = new ArrayList<Tile>();
        ArrayList<Tile> baseZone = this.firstLvlTileFromBb_TMS();
        ArrayList<Tile> novelZone = caDeNew.firstLvlTileFromBb_TMS();

        for (Tile t : novelZone) {

            if (!baseZone.contains(t)) resultante.add(t);
        }

        return resultante;
    }


    public String getWMSdescriptor() {
        //todo multilayers?
        return "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=" + this.layers.get(0);
    }

    //todo controle de la présence de tout les fichier
    public boolean checkIntegrity() {
        return true;
    }

    ;

}
