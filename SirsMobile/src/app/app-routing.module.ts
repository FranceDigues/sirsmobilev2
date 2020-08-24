import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LeftSlideGalleryComponent } from './sliders/left/gallery/gallery.component';
import { LeftSlideSynchronisationComponent } from './sliders/left/synchronisation/synchronisation.component';

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
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
