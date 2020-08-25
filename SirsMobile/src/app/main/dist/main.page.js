"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MainPage = void 0;
var core_1 = require("@angular/core");
var proj_1 = require("ol/proj");
var proj4_1 = require("proj4");
var proj4_2 = require("ol/proj/proj4");
var MainPage = /** @class */ (function () {
    function MainPage(ol, geoloc, editionLayer, geolocLayer, sirsDocSrvc, mapService, backLayer, appLayer, authService, menu, backLayerService, appVersionsService) {
        this.ol = ol;
        this.geoloc = geoloc;
        this.editionLayer = editionLayer;
        this.geolocLayer = geolocLayer;
        this.sirsDocSrvc = sirsDocSrvc;
        this.mapService = mapService;
        this.backLayer = backLayer;
        this.appLayer = appLayer;
        this.authService = authService;
        this.menu = menu;
        this.backLayerService = backLayerService;
        this.appVersionsService = appVersionsService;
        this.navbarController = true; // ? mb remove bcs unused
        this.backLayerService.init();
        this.appVersionsService.init();
    }
    MainPage.prototype.ngAfterViewInit = function () {
        this.sirsDocSrvc.initializeDoc()
            .then(function (sirsDoc) {
            proj4_1["default"].defs(sirsDoc.epsgCode, sirsDoc.proj4);
            proj4_2.register(proj4_1["default"]);
        });
        this.ol.createMap('map');
        this.ol.getMap().setView(this.mapService.currentView);
        this.ol.addLayer(this.backLayer.backLayer);
        this.ol.addLayer(this.appLayer.appLayer);
        this.ol.addLayer(this.editionLayer.editionLayer);
        this.ol.addLayer(this.geolocLayer.geolocLayer);
    };
    MainPage.prototype.locateMe = function () {
        var _this = this;
        this.geoloc.getCurrentLocation()
            .then(function (result) {
            console.log(result);
            _this.zoomToMe();
        }, function (error) {
            console.log('Error getting location', error);
        });
    };
    MainPage.prototype.zoomToMe = function () {
        var coords = this.geoloc.getCoords();
        if (coords) {
            var map = this.ol.getMap();
            map.getView().setCenter(proj_1.transform([coords.longitude, coords.latitude], 'EPSG:4326', 'EPSG:3857'));
            map.getView().setZoom(18);
            this.geolocLayer.redrawGeolocLayer(coords);
        }
    };
    MainPage.prototype.refresh = function () {
        // window.location.reload();
    };
    MainPage.prototype.logout = function () {
        this.authService.logout();
    };
    MainPage.prototype.openSliderLeft = function () {
        this.menu.open('left-slider');
    };
    MainPage.prototype.openSliderRight = function () {
        this.menu.open('right-slider');
    };
    MainPage = __decorate([
        core_1.Component({
            selector: 'app-main',
            templateUrl: './main.page.html',
            styleUrls: ['./main.page.scss']
        })
    ], MainPage);
    return MainPage;
}());
exports.MainPage = MainPage;
