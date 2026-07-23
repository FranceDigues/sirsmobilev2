import {Component, Input, OnInit} from '@angular/core';
import {ObjectDetails} from "../../../services/object-details.service";


@Component({
  selector: 'details-content',
  templateUrl: './detailscontent.component.html',
  styleUrls: ['./detailscontent.component.scss'],
})
export class DetailsContentComponent implements OnInit{

    @Input() objectType;
    @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres' | 'photos';


    ngOnInit(): void {}
}
