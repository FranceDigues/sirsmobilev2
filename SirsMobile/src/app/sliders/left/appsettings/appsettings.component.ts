import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalConfigService } from 'src/app/globalconfig.service';

@Component({
  selector: 'left-slide-appsettings',
  templateUrl: './appsettings.component.html',
  styleUrls: ['./appsettings.component.scss'],
})
export class AppsettingsLeftSlideComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<String>();

  constructor(private globalConfig: GlobalConfigService) { }

  ngOnInit() {}

  goBack() {
    this.slidePathChange.emit('menu');
  }

  updateGlobalConfig(state) {
    this.globalConfig.updateValue(state);
    console.log('updatedState:', state);
  }

  getGlobalConfig() {
    return this.globalConfig.getValue();
  }

}
