/**
 * Created by roch Dardie on 27/04/15.
 */
public class BBox {
    double north;
    double south;
    double east;
    double west;

    public BBox(double north, double south, double east, double west) {
        this.north = north;
        this.south = south;
        this.east = east;
        this.west = west;
    }

    public BBox() {}



    @Override
    public String toString() {
        return "BBox{" +
                "north=" + north +
                ", south=" + south +
                ", east=" + east +
                ", west=" + west +
                '}';
    }


//todo implement
    //Todo trouver biblio simple de convertion?
    public BBox toESPG3857(){

       GeoPoint pBg =  new GeoPoint(south, west);
       GeoPoint pHd =  new GeoPoint(north, east);

        pHd = pHd.toESPG3857();
        pBg = pBg.toESPG3857();

        return new BBox(pHd.getLat(),pBg.getLat(),pHd.getLon(),pBg.getLon());

    }
}
