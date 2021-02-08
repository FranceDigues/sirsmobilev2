import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from 'src/app/services/gallery.service';

@Component({
  selector: 'gallery-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class GalleryDocumentComponent implements OnInit {

  constructor(public gallery: GalleryService, private route: Router) { }

  ngOnInit() {
    // this.gallery.downloadRemoteDocuments();
  }

  goBack() {
    this.route.navigateByUrl('/main');
  }

}
