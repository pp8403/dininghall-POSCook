import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';


import { Clipboard } from '@ionic-native/clipboard';

/**
 * Generated class for the SettingLocalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting-local',
  templateUrl: 'setting-local.html',
})
export class SettingLocalPage {

  formValue = new Map();


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common: CommonProvider,
    private http: HttpRequestProvider,
    private clipboard: Clipboard,
  ) {

  }

  ionViewWillLeave() {


  }
  
  ionViewDidEnter() {
    
    this.common.GetStorage(this.common.LSName_UUID).then(uuid => this.formValue['uuid'] = uuid);
    this.common.GetStorage(this.common.LSName_APIURL).then(apiurl => this.formValue['apiurl'] = apiurl);
    
  }

  copyUUID() {
    this.clipboard.copy(this.formValue['uuid']).then(_ => this.common.Toast('UUID已复制成功'));
  }
  apiurlBlur() {
    this.saveAPIURL().then().catch(rej => { });
  }
  saveAPIURL() {
    if (this.formValue['apiurl']) {
      let apiurl = this.formValue['apiurl'] + "";
      if (apiurl.toUpperCase().startsWith("HTTP://")) {
        apiurl = apiurl.substr(7);
      }
      while (apiurl.endsWith('/')) {
        apiurl = apiurl.substr(0, apiurl.length - 1);
      }
      this.formValue['apiurl'] = apiurl;
      return this.common.SetStorage(this.common.LSName_APIURL, apiurl).then(() => {
        return Promise.resolve(apiurl);
      });
    } else {
      return Promise.reject("未输入任何信息");
    }
  }

  testConnect() {
    this.saveAPIURL().then(apiurl => {
      this.common.LoadingShow();
      this.http.Request("test", {}).then(res => {
        this.common.LoadingHide();
        this.common.Toast(res.msg);
      }, err => {
        this.common.LoadingHide();
        this.common.Alert("接口连接失败!!");
      });
    }).catch(rej => {
      this.common.Toast(rej);
    });
  }

  
}
