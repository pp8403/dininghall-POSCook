import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CommonProvider } from '../providers/common/common';



//import { UsbnfcProvider } from '../providers/usbnfc/usbnfc';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'BasehomePage';
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private common: CommonProvider,
    
    //private usbnfc: UsbnfcProvider,
  ) {
    platform.ready().then(() => {
      //this.secscreen.init();
      
      //this.usbnfc.init();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // document.addEventListener("resume", () => {
      //   this.secscreen.init();
      //   this.common.GotoBasePage();
      // }, false);
      // document.addEventListener("pause", () => {
      //   //alert("pause");
      //   //platform.exitApp();

      // }, false);
      platform.resume.subscribe((result) => {
        //this.secscreen.init();
        this.common.GotoBasePage();
      });
      

    });
  }
}

