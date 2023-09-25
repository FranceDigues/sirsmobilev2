import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-laisse-crue',
  templateUrl: './laisse-crue.component.html',
  styleUrls: ['./laisse-crue.component.scss'],
})
export class LaisseCrueComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.initHeight();
  }

  initHeight() {
    this.EOS.objectDoc.hauteur = this.EOS.objectDoc.hauteur || 0;
  }

}
