import android.util.Log;

import java.util.ArrayList;

/**
 * Created by harksin on 22/04/15.
 */
public class Tile {
    private int x;
    private int y;
    private int z;

    public Tile() {
    }


    public Tile(int z,int x, int y) {
        this.setX(x);
        this.setY(y);
        this.setZ(z);
    }


    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getZ() {
        return z;
    }

    public void setZ(int z) {
        this.z = z;
    }

    @Override
    public String toString() {
        return "Tile{" +
                "x=" + x +
                ", y=" + y +
                ", z=" + z +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Tile tile = (Tile) o;

        if (x != tile.x) return false;
        if (y != tile.y) return false;
        if (z != tile.z) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = x;
        result = 31 * result + y;
        result = 31 * result + z;
        return result;
    }

    //methode

    public ArrayList<Tile> subServientTile_TMS(){
        ArrayList<Tile> aTile = new ArrayList<Tile>();
        final int Z = this.getZ()-1;
        final int X = (this.getX())/2;
        final int Y = (this.getY())/2;

        //detection
        aTile.add(new Tile(Z,X,Y));
        aTile.add(new Tile(Z,X+1,Y));
        aTile.add(new Tile(Z,X+1,Y+1));
        aTile.add(new Tile(Z,X,Y+1));


        Log.d("PluginRDE_debug_DL", "sous Arbre : " + aTile.toString());
        return aTile;


    }


    public String getTMSsampleReq(){ //Todo Final?

       return this.getZ() + "/" + this.getX() + "/" + this.getY() + ".png";
    }

    public String getWMSsampleReq(){ //Todo gestion de autre que utm

        BBox projected = this.getBoundingBox("unUse").toESPG3857();

//        return "&CRS=EPSG%3A3857&STYLES=&WIDTH=1249&HEIGHT=951&BBOX=7738.824463716999%2C5097622.817222515%2C771497.6110891982%2C5679155.728416136";
        return "&CRS=EPSG%3A3857&STYLES=&WIDTH=256&HEIGHT=256&BBOX="+projected.west+"%2C"+projected.south+"%2C"+projected.east+"%2C"+projected.north;


    }





    public BBox getBoundingBox(String CRS) {
        BBox bb = new BBox();
        bb.north = tile2lat(this.getY(), this.getZ());
        bb.south = tile2lat(this.getY() + 1, this.getZ());
        bb.west = tile2lon(this.getX(), this.getZ());
        bb.east = tile2lon(this.getX() + 1, this.getZ());
        return bb;
    }

    static double tile2lon(int x, int z) {
        return x / Math.pow(2.0, z) * 360.0 - 180;
    }

    static double tile2lat(int y, int z) {
        double n = Math.PI - (2.0 * Math.PI * y) / Math.pow(2.0, z);
        return Math.toDegrees(Math.atan(Math.sinh(n)));
    }


}
