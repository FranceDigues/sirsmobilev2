import { Component, OnInit } from '@angular/core';
import { GalleryService } from 'src/app/services/gallery.service';

@Component({
  selector: 'left-slide-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class LeftSlideGalleryComponent implements OnInit {

  constructor(public gallery: GalleryService) { }

  ngOnInit() {}

}
