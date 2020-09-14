import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';
import { Toast } from '@ionic-native/toast/ngx';

const { Network } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  networkStatus: NetworkStatus = null;
  networkListener: PluginListenerHandle;

  constructor(private platform: Platform, private splashScreen: SplashScreen,
              private statusBar: StatusBar, private toast: Toast) {
                this.initializeApp();
              }

  ngOnInit() {
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed', status);
      if (!this.networkStatus || status.connected !== this.networkStatus.connected) {
        if (status.connected) {
          this.toast.showLongTop('Connexion établie avec succès').subscribe();
        } else {
          this.toast.showLongTop('La connexion a échoué').subscribe();
        }
      }
      this.networkStatus = status;
    });
  }

  ngOnDestroy() {
    this.networkListener.remove();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
