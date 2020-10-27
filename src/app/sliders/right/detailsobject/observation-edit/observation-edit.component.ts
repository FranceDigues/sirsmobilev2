import { AfterViewInit, Component, Directive, ElementRef, EventEmitter, OnInit, Output, ViewChild, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObservationEditService } from 'src/app/observationedit.service';
import { GlobalConfigService } from '../../../../globalconfig.service';

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
  view: 'form' | 'media';
  tab: 'medias' | 'evolution' | 'urgence' | 'nombre' | 'suite' | 'observateur';
  config: 'fullName' | 'abstract' | 'both';


  constructor(private activeRoute: ActivatedRoute, public OES: ObservationEditService,
              private cdr: ChangeDetectorRef, private globalConfigService: GlobalConfigService) {
    this.objectId = this.activeRoute.snapshot.paramMap.get('objectId');
    this.obsId = this.activeRoute.snapshot.paramMap.get('obsId');

    this.view = 'form';
    this.tab = 'medias';
    this.config = this.globalConfigService.context;

    this.OES.init(this.objectId, this.obsId);

    // TODO CHECK inits -> doc.author + mb hidden inits

  }

  ngOnInit() {}

  ngAfterViewInit() {
    const elem = this.tabsMaterialize.nativeElement;

    const options = {};
    new M.Tabs(elem, options); // initialize materialize tabs to show indicator
  }

  setView(str: 'form' | 'media') {
    this.view = str;
    this.cdr.detectChanges();
  }

  setTab(str: 'medias' | 'evolution' | 'urgence' | 'nombre' | 'suite' | 'observateur') {
    this.tab = str;
  }

  goToMedia() {
    this.setView('media');
  }

  showText(str: 'fullName' | 'abstract' | 'both') {
    const isSameString = this.config === str;
    return isSameString;
  }

  changeUrgence() {
    this.OES.doc.urgenceId = 'RefUrgence:' + this.OES.urgence;
  }

  changeContact() {
      this.OES.doc.observateurId = this.OES.contact;
  }

  compareRef(obj1, obj2) {
    let a, b, comparison;
    comparison = 0;
    if (this.showText('fullName')) {
        a = obj1.libelle;
        b = obj2.libelle;
    } else {
        a = obj1.abrege ? obj1.abrege : obj1.designation;
        b = obj2.abrege ? obj2.abrege : obj2.designation;
    }

    if (a > b) {
        comparison = 1;
    } else if (a < b) {
        comparison = -1;
    }

    return comparison;
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

@Pipe({
  name: 'sortByDocNom'
})
export class ArraySortPipe2  implements PipeTransform {

  transform(value: any, exponent: any) {
    const data = value.sort(this.sortOn());
    return data;
  }

  sortOn() {
    return (a, b) => {
      if (a.doc.nom.toLowerCase() < b.doc.nom.toLowerCase()) {
        return -1;
      } else if (a.doc.nom.toLowerCase() > b.doc.nom.toLowerCase()){
        return 1;
      } else {
          return 0;
      }
    };
  }
}
