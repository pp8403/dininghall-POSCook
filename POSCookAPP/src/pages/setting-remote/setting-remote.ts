import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';

/**
 * Generated class for the SettingRemotePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting-remote',
  templateUrl: 'setting-remote.html',
})
export class SettingRemotePage {
  formValue = new Map();
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common: CommonProvider,
    private http: HttpRequestProvider,
    private inAppBrowser: InAppBrowser,
    ) {
  }
  

  ionViewDidEnter() {
    
    this.common.GetStorage(this.common.LSName_cantingName).then(res => this.formValue['cantingName'] = res);
    this.common.GetStorage(this.common.LSName_machineName).then(res => this.formValue['machineName'] = res);
    
    

  }

  openSeturl(): void {
    this.inAppBrowser.create("http://"+this.common.APIHost, '_system');
  }
  clearCache(){
    this.http.Request("clearCache", {type:'all'}).then(res=>{
      this.common.LoadingHide();
      this.common.Toast('服务器缓存已清除','bottom');
    },error=>{
      this.common.LoadingHide();
      this.common.Alert(error);
    });
  }
}
