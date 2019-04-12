import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';
import { SettimeoutProvider } from '../../providers/settimeout/settimeout';

/**
 * Generated class for the TvhomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tvhome',
  templateUrl: 'tvhome.html',
})
export class TvhomePage {

  formValue = new Set();
  
  curMealName = "";
  strTimeNowShow = "";

  interval = null;
  //timeout_getpro = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common:CommonProvider,
    private http:HttpRequestProvider,
    private settimeout:SettimeoutProvider
    ) {
    window['TVHomePage'] = this;
    this.formValue["orders"] = [];
  }

  _TouchPage(): number {
    return 1;
  }

  ionViewDidEnter() {
    this.common.GetStorage(this.common.LSName_curMealName).then(curMealName => this.curMealName = curMealName);
    this.common.GetStorage(this.common.LSName_machineName).then(machineName => this.formValue["machineName"] = machineName);
    this.common.GetStorage(this.common.LSName_cantingName).then(cantingName => this.formValue["cantingName"] = cantingName);


    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.strTimeNowShow = this.common.GetNowFormatDate(1);
    }, 1000);

    this.getCookedOrders();
    
  }

  getCookedOrders() {
    this.settimeout.clear();
    this.http.Request("getCookedOrders", {minu:5}).then(res => {
      this.formValue["orders"] = res.data;
      this.settimeout.regAction(() => {
        this.getCookedOrders();
      }, 10000);
    }, err => {
      this.formValue["orders"] = [];

      let msgArr = [];
      msgArr.push(err);
      this.common.ShowErrorModal("系统设置错误", msgArr,20);
      this.settimeout.regAction(() => {
        this.getCookedOrders();
      }, 25000);
    });

  }

  ionViewWillLeave() {
    // 清除定时器
    clearInterval(this.interval);
    this.settimeout.clear();
    
  }


}
