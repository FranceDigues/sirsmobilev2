import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'left-slide-appsettings',
  templateUrl: './appsettings.component.html',
  styleUrls: ['./appsettings.component.scss'],
})
export class AppsettingsLeftSlideComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();

  constructor(private globalConfig: ConfigService) { }

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
