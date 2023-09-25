import { Component, OnInit } from '@angular/core';
import { EditObjectService } from 'src/app/services/edit-object.service';

@Component({
  selector: 'form-ouvrage-particulier',
  templateUrl: './ouvrage-particulier.component.html',
  styleUrls: ['./ouvrage-particulier.component.scss'],
})
export class OuvrageParticulierComponent implements OnInit {

  constructor(public EOS: EditObjectService) { }

  ngOnInit() {
  }
}
