import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';
import { SettimeoutProvider } from '../../providers/settimeout/settimeout';
import { AppConfig } from '../../app/AppConfig';
/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  formValue = new Set();

  curMealName = "";
  strTimeNowShow = "";

  interval = null;
  //timeout_getpro = null;

  pressKeyCode:any;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common: CommonProvider,
    private http: HttpRequestProvider,
    private settimeout: SettimeoutProvider,
  ) {
    /*
    this.formValue["lstPaidOreder"] = [];
    this.formValue["lstOrderCount"] = [];
    */
    this.formValue["lstOreder_unCooked"] = [];
    this.formValue["lstOrder_Cooked"] = [];
    this.formValue["unCooked"] = 0;
    this.formValue["Cooked"] = 0;
  }

  ionViewDidEnter() {

    this.regKeyPress(1);
    this.common.GetStorage(this.common.LSName_curMealName).then(curMealName => this.curMealName = curMealName);
    this.common.GetStorage(this.common.LSName_machineName).then(machineName => this.formValue["machineName"] = machineName);
    this.common.GetStorage(this.common.LSName_cantingName).then(cantingName => this.formValue["cantingName"] = cantingName);


    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.formValue["strTimeNowShow"] = this.common.GetNowFormatDate(1);
    }, 1000);

    this.loadPaidOrders();



  }
  regKeyPress(type) {
    if (type == 1) {
      document.onkeypress = (e) => {
        this.pressKeyCode=e.which;
       console.log(`====>key:${e.which}`);
        //let code = String.fromCharCode(e.which);
        if (e.which >= 49 && e.which <= 57) {//数字1-9
          let index = parseInt(String.fromCharCode(e.which));
          console.log(`====>key:${index}`,this.formValue["lstOreder_unCooked"].length );
          if (this.formValue['lstOreder_unCooked'].length >= index) {
            let order = this.formValue['lstOreder_unCooked'][index - 1];
            this.changeStaus(order.orderid, order.iscooked);
            console.log(`====>key:${index},changeStaus(${order.orderid},${order.iscooked})`);
          }
        } else if (e.which == 13 || e.which == 10 ) {
          if (this.formValue['lstOreder_unCooked'].length > 0) {
            let order = this.formValue['lstOreder_unCooked'][0];
            this.changeStaus(order.orderid, order.iscooked);
            console.log(`====>key:Enter,changeStaus(${order.orderid},${order.iscooked})`);
          }
        }
      };
    } else {
      document.onkeypress = (e) => { };
    }
  }
  loadPaidOrders() {
    this.settimeout.clear();
    //从服务器读取
    //this.common.LoadingShow();
    return this.http.Request("getPaidOrders", {}).then(res => {
      /*
      this.formValue["lstPaidOreder"] = res.data.lstPaidOreder;
      this.formValue["lstOrderCount"] = res.data.lstOrderCount;
      this.settimeout.regAction(() => {
        this.loadPaidOrders();
      }, 10000);
      let unCooked=0;
      let Cooked=0;
      for(let order of res.data.lstPaidOreder){
        if(order.iscooked==1) Cooked++;
        else unCooked++;
      }
      this.formValue["unCooked"] =unCooked;
      this.formValue["Cooked"] =Cooked;
      */

      this.formValue["lstOreder_unCooked"] = res.data.lstOreder_unCooked;
      this.formValue["lstOrder_Cooked"] = res.data.lstOrder_Cooked;
      this.settimeout.regAction(() => {
        this.loadPaidOrders();
      }, 3000);
      this.formValue["unCooked"] = res.data.lstOreder_unCooked.length;
      this.formValue["Cooked"] = res.data.CookedLength;


    }, err => {
      /*
      this.formValue["lstPaidOreder"] = [];
      this.formValue["lstOrderCount"] = [];
      */

      this.formValue["lstOreder_unCooked"] = [];
      this.formValue["lstOrder_Cooked"] = [];

      let msgArr = [];
      msgArr.push(err);

      this.common.ShowErrorModal("系统设置错误", msgArr, 20);
      this.settimeout.regAction(() => {
        this.loadPaidOrders();
      }, 25000);
    });

  }

  ionViewWillLeave() {
    // 清除定时器
    clearInterval(this.interval);
    this.settimeout.clear();
    //取消按键监听
    this.regKeyPress(0);
    console.log("===>homepage leave");
  }

  gotoSysSetting() {
    //this.navCtrl.setRoot("SettingPage");
    this.navCtrl.push("SettingPage");
  }


  changeStaus(orderid, iscooked) {
    console.log(orderid, iscooked);
    let msg = `是否确定修改状态为[${iscooked == 1 ? "未出餐" : "已出餐"}]`;
    //this.common.AlertWithCancel('',()=>{
    this.common.LoadingShow();
    this.http.Request("setOrderCooked", { orderid: orderid, cooked: iscooked }).then(res => {
      this.common.LoadingHide();
      this.loadPaidOrders();

    }, err => {
      this.common.LoadingHide();
      let msgArr = [];
      msgArr.push(err);
      this.common.ShowErrorModal("设置出错", msgArr, 20);

    });
    //},()=>{},0,msg,'确定','取消');
  }

  public getUserCNname(userName) {
    let n = userName.indexOf('(') > -1 ? userName.match('\\((.+?)\\)')[1] : userName;
    if (n.length > 10) n = n.substr(0, 10);
    return n;
  }
}
