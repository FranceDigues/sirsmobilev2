"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MainPageModule = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var angular_1 = require("@ionic/angular");
var main_routing_module_1 = require("./main-routing.module");
var main_page_1 = require("./main.page");
var ol_service_1 = require("@lib-map/ol.service");
var ngx_1 = require("@ionic-native/geolocation/ngx");
var geoloc_service_1 = require("../geoloc.service");
var map_service_1 = require("../map.service");
var style_service_1 = require("../style.service");
var editionmode_service_1 = require("../editionmode.service");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var icon_1 = require("@angular/material/icon");
var flex_layout_1 = require("@angular/flex-layout");
var left_component_1 = require("../sliders/left/left.component");
var right_component_1 = require("../sliders/right/right.component");
var menu_component_1 = require("../sliders/left/menu/menu.component");
var appinfos_component_1 = require("../sliders/left/appinfos/appinfos.component");
var appsettings_component_1 = require("../sliders/left/appsettings/appsettings.component");
var database_service_1 = require("../database.service");
var synchronisation_component_1 = require("../sliders/left/synchronisation/synchronisation.component");
var sirsdoc_service_1 = require("../sirsdoc.service");
var gallery_component_1 = require("../sliders/left/gallery/gallery.component");
var document_component_1 = require("../sliders/left/gallery/document/document.component");
var medias_component_1 = require("../sliders/left/gallery/medias/medias.component");
var backmap_component_1 = require("../sliders/left/backmap/backmap.component");
var addbacklayer_component_1 = require("../sliders/left/backmap/addbacklayer/addbacklayer.component");
var MainPageModule = /** @class */ (function () {
    function MainPageModule() {
    }
    MainPageModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                angular_1.IonicModule,
                main_routing_module_1.MainPageRoutingModule,
                ng_bootstrap_1.NgbCollapseModule, icon_1.MatIconModule,
                flex_layout_1.FlexLayoutModule,
            ],
            providers: [
                ol_service_1.OLService,
                ngx_1.Geolocation,
                geoloc_service_1.GeolocService,
                map_service_1.MapService,
                style_service_1.RealPositionStyle,
                editionmode_service_1.EditionModeService,
                database_service_1.DatabaseService,
                sirsdoc_service_1.SirsDocService,
            ],
            declarations: [main_page_1.MainPage, left_component_1.LeftSlideComponent, right_component_1.RightSlideComponent, menu_component_1.LeftSlideMenuComponent,
                appinfos_component_1.AppinfosLeftSlideComponent, appsettings_component_1.AppsettingsLeftSlideComponent, synchronisation_component_1.LeftSlideSynchronisationComponent,
                gallery_component_1.LeftSlideGalleryComponent, document_component_1.GalleryDocumentComponent, medias_component_1.GalleryMediasComponent,
                backmap_component_1.LeftSlideBackmapComponent, addbacklayer_component_1.LeftSlideAddBackLayerComponent]
        })
    ], MainPageModule);
    return MainPageModule;
}());
exports.MainPageModule = MainPageModule;
