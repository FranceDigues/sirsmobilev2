import { NgModule } from '@angular/core';
import {
    PreloadAllModules,
    RouterModule,
    Routes
} from '@angular/router';
import { LeftSlideCacheComponent } from './components/left-panel/backmap/cache/cache.component';
import { CacheModule } from './components/left-panel/backmap/cache/cache.module';
import { GalleryComponent } from './components/left-panel/gallery/gallery.component';
import { GalleryModule } from './components/left-panel/gallery/gallery.module';
import { DatabaseSyncComponent } from './components/database-sync/database-sync.component';
import { DatabaseSyncModule } from './components/database-sync/database-sync.module';
import { RightPanelModule } from './components/right-panel/right-panel.module';
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
        component: DatabaseSyncComponent
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
        DatabaseSyncModule,
        GalleryModule,
        CacheModule,
        RightPanelModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
