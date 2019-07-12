import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { UpdateProvider } from '../../providers/update/update';
import { CommonProvider } from '../../providers/common/common';
/**
 * Generated class for the SettingAppversionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting-appversion',
  templateUrl: 'setting-appversion.html',
})
export class SettingAppversionPage {
  appversion:string;
  apkurl:string='';
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private updateService:UpdateProvider,
    private common: CommonProvider,) {
  }

  

  ionViewDidEnter(){
    this.updateService.getVersionNumber().then(res=>this.appversion=res);
    this.updateService.getQrCode().then(res=>this.apkurl=res);
  }
  checkUpdate(){
    this.updateService.checkUpdate(true).then(_=>this.updateService.getQrCode().then(res=>this.apkurl=res));
  }
}
