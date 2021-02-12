import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'forms-template',
    templateUrl: './forms-template.component.html',
    styleUrls: ['./forms-template.component.scss'],
})
export class FormsTemplateComponent implements OnInit {

    @Input() type: string;

    constructor() {
    }

    ngOnInit() {

    }

}
