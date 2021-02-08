import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-largeur-franc-bord',
  templateUrl: './largeur-franc-bord.component.html',
  styleUrls: ['./largeur-franc-bord.component.scss'],
})
export class LargeurFrancBordComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
    this.EOS.setupRef('typeLargeurFrancBord', this.EOS.refs.RefLargeurFrancBord[0]);
  }

}
