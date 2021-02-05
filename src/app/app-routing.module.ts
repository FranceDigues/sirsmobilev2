import { Injectable, NgModule } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    PreloadAllModules,
    Resolve,
    RouterModule,
    RouterStateSnapshot,
    Routes
} from '@angular/router';
import { LeftSlideCacheComponent } from './sliders/left/backmap/cache/cache.component';
import { CacheModule } from './sliders/left/backmap/cache/cache.module';
import { LeftSlideGalleryComponent } from './sliders/left/gallery/gallery.component';
import { GalleryModule } from './sliders/left/gallery/gallery.module';
import { LeftSlideSynchronisationComponent } from './sliders/left/synchronisation/synchronisation.component';
import { SynchronisationModule } from './sliders/left/synchronisation/synchronisation.module';
import { ObservationEditComponent } from './sliders/right/detailsobject/observation-edit/observation-edit.component';
import { ObservationEditModule } from './sliders/right/detailsobject/observation-edit/observation-edit.module';
import { RightSlideEditObjectsComponent } from './sliders/right/editobjects/editobjects.component';
import { EditObjectsModule } from './sliders/right/editobjects/editobjects.module';
import { RightSlideModule } from './sliders/right/right-slide.module';
import { Observable } from "rxjs";
import { LocalDatabase } from "./usingLocalDatabase.service";
import { EditionModeService } from "./editionmode.service";
import { ObjectDocResolver } from "./resolvers/object-doc-resolver";
import { RefTypesResolver } from "./resolvers/ref-types-resolver";
import { OrientationListResolver } from "./resolvers/orientation-list-resolver";
import { CoteListResolver } from "./resolvers/cote-list-resolver";

const routes: Routes = [
    {
        path: '',
        redirectTo: 'database-connection',
        pathMatch: 'full'
    },
    {
        path: 'database-connection',
        loadChildren: () => import('./database-connection/database-connection.module').then(m => m.DatabaseConnectionPageModule)
    },
    {
        path: 'main',
        loadChildren: () => import('./main/main.module').then(m => m.MainPageModule)
    },
    {
        path: 'sync',
        component: LeftSlideSynchronisationComponent
    },
    {
        path: 'gallery',
        component: LeftSlideGalleryComponent
    },
    {
        path: 'cache/:id',
        component: LeftSlideCacheComponent
    },
    {
        path: 'object/:type/:id',
        component: RightSlideEditObjectsComponent,
        resolve: {
            objectDoc: ObjectDocResolver,
            refTypes: RefTypesResolver,
            orientationList: OrientationListResolver,
            coteList: CoteListResolver

        }
    },
    {
        path: 'observation/:objectId/:obsId',
        component: ObservationEditComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
        SynchronisationModule,
        GalleryModule,
        CacheModule,
        RightSlideModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
