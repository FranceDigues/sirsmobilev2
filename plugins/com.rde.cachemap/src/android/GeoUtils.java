import java.io.File;
import java.util.ArrayList;

/**
 * Created by roch dardie on 22/04/15.
 */
public  class GeoUtils {


    public static ArrayList<Tile> subServientTile_TMS(Tile t){
        ArrayList<Tile> aTile = new ArrayList<Tile>();
        final int Z = t.getZ();
        final int X = (t.getZ())*Z;
        final int Y = (t.getZ())*Z;

        aTile.add(new Tile(Z+1,X,Y));
        aTile.add(new Tile(Z+1,X+1,Y));
        aTile.add(new Tile(Z+1,X+1,Y+1));
        aTile.add(new Tile(Z+1,X+1,Y+1));

        return aTile;
    }









}
