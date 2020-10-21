import { AfterViewInit, Component, Directive, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObservationEditService } from 'src/app/observationedit.service';

declare var M: any;

@Component({
  selector: 'app-observation-edit',
  templateUrl: './observation-edit.component.html',
  styleUrls: ['./observation-edit.component.scss'],
})
export class ObservationEditComponent implements OnInit, AfterViewInit {

  @ViewChild('tabs') tabsMaterialize: ElementRef;

  objectId: string;
  obsId: string;
  view: 'form' | 'note' | 'media';
  tab: 'medias' | 'evolution' | 'urgence' | 'nombre' | 'suite' | 'observateur';

  troncons: Array<any>;

  constructor(private activeRoute: ActivatedRoute, public OES: ObservationEditService) {
    this.objectId = this.activeRoute.snapshot.paramMap.get('objectId');
    this.obsId = this.activeRoute.snapshot.paramMap.get('obsId');

    this.OES.init(this.objectId, this.obsId);

    this.view = 'form';
    this.tab = 'medias';

    // TODO CHECK inits -> doc.author + mb hidden inits

    this.troncons = []; // Y'a un truc en plus à init pour troncons

  }

  ngOnInit() {}

  ngAfterViewInit() {
    const elem = this.tabsMaterialize.nativeElement;

    const options = {};
    new M.Tabs(elem, options); // initialize materialize tabs to show indicator
  }

  setView(str: 'form' | 'note' | 'media') {
    this.view = str;
  }

  setTab(str: 'medias' | 'evolution' | 'urgence' | 'nombre' | 'suite' | 'observateur') {
    this.tab = str;
  }

  goToMedia() {
    this.setView('media');
  }

}

@Directive({
  selector: '[ngInit]'
})
export class NgInitDirective implements OnInit {

  @Output() ngInit: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
      this.ngInit.emit();
  }
}
