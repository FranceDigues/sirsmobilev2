import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from 'src/app/services/gallery.service';

@Component({
  selector: 'gallery-medias',
  templateUrl: './medias.component.html',
  styleUrls: ['./medias.component.scss'],
})
export class GalleryMediasComponent implements OnInit {

  constructor(public gallery: GalleryService, private route: Router) { }

  ngOnInit() {
    // this.gallery.downloadRemoteDocuments();
  }

  goBack() {
    this.route.navigateByUrl('/main');
  }
}
