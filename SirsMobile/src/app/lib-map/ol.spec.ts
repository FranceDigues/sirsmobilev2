import { TestBed } from '@angular/core/testing';
import { OLService } from './ol.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

describe('Testing OpenLayers', () => {

    let olService: OLService;

    const layer = new TileLayer(
        {
          title: 'Global Imagery',
          source: new OSM()
        }
    );

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OLService
            ]
        });
    });

    beforeEach(() => {
        olService = TestBed.inject(OLService);
    });

    it('createMap method should exists', () => {
        const res = typeof olService.createMap === 'function';
        expect(res).toEqual(true);
    });

    it('createMap method should return a new OL Map and save it in variable in service', () => {
        const res = olService.createMap('test');
        expect(res).toEqual(olService.map);
    });

    it('getMap method should exists', () => {
        const res = typeof olService.getMap === 'function';
        expect(res).toEqual(true);
    });

    it('getMap method should return map already created', () => {
        expect(olService.getMap()).toEqual(null);
        olService.createMap('map');
        expect(olService.getMap()).not.toEqual(null);
    });

    it('addLayer method should exists', () => {
        const res = typeof olService.addLayer === 'function';
        expect(res).toEqual(true);
    });

    it('addLayer method should add a layer to the already created map', () => {
        const layer1 = new TileLayer(
            {
              title: 'Test1',
              source: new OSM()
            }
        );
        const layer2 = new TileLayer(
            {
              title: 'Test2',
              source: new OSM()
            }
        );
        olService.createMap('map');
        olService.addLayer(layer);
        let layers = olService.getLayers();
        expect(layers.length).toEqual(1);
        olService.addLayer(layer1);
        olService.addLayer(layer2);
        layers = olService.getLayers();
        expect(layers.length).toEqual(3);
    });

    it('getLayers method should exists', () => {
        const res = typeof olService.getLayers === 'function';
        expect(res).toEqual(true);
    });

    it('getLayers method should return an array with all layers of the current map', () => {
        olService.createMap('map');
        olService.addLayer(layer);
        const res = olService.getLayers();
        expect(res[0]).toEqual(layer);
    });

    it('removeLayer method should exists', () => {
        const res = typeof olService.removeLayer === 'function';
        expect(res).toEqual(true);
    });

    it('removeLayer method should remove the targetted layer of the current map', () => {
        olService.createMap('map');
        olService.addLayer(layer);
        let layers = olService.getLayers();
        expect(layers.length).toEqual(1);
        olService.removeLayer(layer);
        layers = olService.getLayers();
        expect(layers.length).toEqual(0);
    });

    it('moveUp method should exists', () => {
        const res = typeof olService.moveUp === 'function';
        expect(res).toEqual(true);
    });

    it('moveDown method should exists', () => {
        const res = typeof olService.moveDown === 'function';
        expect(res).toEqual(true);
    });
});
