import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from 'src/app/gallery.service';

@Component({
  selector: 'gallery-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class GalleryDocumentComponent implements OnInit {

  constructor(public gallery: GalleryService, private route: Router) { }

  ngOnInit() {
    console.log('availableFiles', this.gallery.availableFiles);
    // this.gallery.downloadRemoteDocuments();
  }

  goBack() {
    this.route.navigateByUrl('/main');
  }

}
