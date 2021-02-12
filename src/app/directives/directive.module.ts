import { NgModule } from '@angular/core';
import { NgInitDirective } from './init.directive';

@NgModule({
    declarations: [NgInitDirective],
    exports:[NgInitDirective]
})
export class DirectiveModule{}