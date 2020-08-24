import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from 'src/app/gallery.service';

@Component({
  selector: 'gallery-medias',
  templateUrl: './medias.component.html',
  styleUrls: ['./medias.component.scss'],
})
export class GalleryMediasComponent implements OnInit {

  constructor(public gallery: GalleryService, private route: Router) { }

  ngOnInit() {
    console.log('availableFiles', this.gallery.availableFiles);
    // this.gallery.downloadRemoteDocuments();
  }

  goBack() {
    this.route.navigateByUrl('/main');
  }
}
