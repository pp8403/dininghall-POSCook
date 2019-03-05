import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';

/**
 * Generated class for the SettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

  tab1Root = "SettingLocalPage";
    tab2Root = "SettingRemotePage";
    tab3Root = "SettingAppversionPage";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common: CommonProvider,
    ) {
    
  }

  

}
