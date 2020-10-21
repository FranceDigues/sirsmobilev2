import { Component, OnInit } from '@angular/core';
import { ObservationEditService } from 'src/app/observationedit.service';

@Component({
  selector: 'observation-media',
  templateUrl: './observation-media.component.html',
  styleUrls: ['./observation-media.component.scss', '../observation-edit.component.scss'],
})
export class ObservationMediaComponent implements OnInit {

  constructor(private OES: ObservationEditService) { }

  ngOnInit() {}

}
