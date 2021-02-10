import { NgModule } from '@angular/core';
import {
    PreloadAllModules,
    RouterModule,
    Routes
} from '@angular/router';
import { LeftSlideCacheComponent } from './sliders/left/backmap/cache/cache.component';
import { CacheModule } from './sliders/left/backmap/cache/cache.module';
import { GalleryComponent } from './sliders/left/gallery/gallery.component';
import { GalleryModule } from './sliders/left/gallery/gallery.module';
import { LeftSlideSynchronisationComponent } from './sliders/left/synchronisation/synchronisation.component';
import { SynchronisationModule } from './sliders/left/synchronisation/synchronisation.module';
import { RightSlideModule } from './sliders/right/right-slide.module';
import { ObjectDocResolver } from './resolvers/object-doc-resolver';
import { RefTypesResolver } from './resolvers/ref-types-resolver';
import { OrientationListResolver } from './resolvers/orientation-list-resolver';
import { CoteListResolver } from './resolvers/cote-list-resolver';
import { ObjectEditComponent } from './components/object-edit/object-edit.component';
import { ObservationEditComponent } from './components/object-details/observation-edit/observation-edit.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'database-connection',
        pathMatch: 'full'
    },
    {
        path: 'database-connection',
        loadChildren: () => import('./components/database-connection/database-connection.module').then(m => m.DatabaseConnectionPageModule)
    },
    {
        path: 'main',
        loadChildren: () => import('./components/main/main.module').then(m => m.MainPageModule)
    },
    {
        path: 'sync',
        component: LeftSlideSynchronisationComponent
    },
    {
        path: 'gallery',
        component: GalleryComponent
    },
    {
        path: 'cache/:id',
        component: LeftSlideCacheComponent
    },
    {
        path: 'object/:type/:id',
        component: ObjectEditComponent,
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
