import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common'

/**
 * Generated class for the NomealPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nomeal',
  templateUrl: 'nomeal.html',
})
export class NomealPage {

  formValue = new Set();


  public strTimeNowShow = "";

  private interval = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common: CommonProvider
  ) {
    window['TVHomePage'] = this;
  }
  _TouchPage(): number {
    return 1;
  }
  
  ionViewDidEnter() {
    this.common.GetStorage(this.common.LSName_machineName).then(machineName => this.formValue["machineName"] = machineName);
      this.common.GetStorage(this.common.LSName_cantingName).then(cantingName => this.formValue["cantingName"] = cantingName);

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.formValue["strTimeNowShow"] = this.common.GetNowFormatDate(1);
      //this.common.GetStorage(this.common.LSName_curMealName).then(curMealName =>{if(curMealName && curMealName.length>0) this.common.GotoBasePage();});
      
    }, 1000);
  }

  ionViewWillLeave() {
    clearInterval(this.interval);
  }

  gotoSysSetting() {
    this.navCtrl.push("SettingPage");
  }

}
