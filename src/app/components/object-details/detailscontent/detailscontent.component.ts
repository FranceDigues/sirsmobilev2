import { Component, Input } from '@angular/core';

@Component({
  selector: 'details-content',
  templateUrl: './detailscontent.component.html',
  styleUrls: ['./detailscontent.component.scss'],
})
export class DetailsContentComponent {

    @Input() objectType;
    @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres' | 'photos';
}
