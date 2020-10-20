import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LeftSlideCacheComponent } from './sliders/left/backmap/cache/cache.component';
import { CacheModule } from './sliders/left/backmap/cache/cache.module';
import { LeftSlideGalleryComponent } from './sliders/left/gallery/gallery.component';
import { GalleryModule } from './sliders/left/gallery/gallery.module';
import { LeftSlideSynchronisationComponent } from './sliders/left/synchronisation/synchronisation.component';
import { SynchronisationModule } from './sliders/left/synchronisation/synchronisation.module';
import { ObservationEditComponent } from './sliders/right/detailsobject/observation-edit/observation-edit.component';
import { RightSlideEditObjectsComponent } from './sliders/right/editobjects/editobjects.component';
import { EditObjectsModule } from './sliders/right/editobjects/editobjects.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'database-connection',
    pathMatch: 'full'
  },
  {
    path: 'database-connection',
    loadChildren: () => import('./database-connection/database-connection.module').then( m => m.DatabaseConnectionPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then( m => m.MainPageModule)
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
    component: RightSlideEditObjectsComponent
  },
  {
    path: 'observation/:objectId/:obsId',
    component: ObservationEditComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    SynchronisationModule,
    GalleryModule,
    CacheModule,
    EditObjectsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
