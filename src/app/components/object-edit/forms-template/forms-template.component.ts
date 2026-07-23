import { Component, Input } from '@angular/core';

@Component({
    selector: 'forms-template',
    templateUrl: './forms-template.component.html',
    styleUrls: ['./forms-template.component.scss'],
})
export class FormsTemplateComponent {

    @Input() type: string;

}
