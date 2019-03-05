import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, App, ModalController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AppConfig } from '../../app/AppConfig';


/*
  Generated class for the CommonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommonProvider {

  public LSName_curMealName = "curMealName";
  public LSName_cantingName = "cantingName";
  public LSName_machineName = "machineName";
  public LSName_APIURL = "APIURL";
  public LSName_refreshValue = "refreshValue";
  public LSName_UUID = "UUID";
  public APIHost: string;

  constructor(private toastCtrl: ToastController,
    public storage: Storage,
    public appCtrl: App,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController) {
    //console.log('Hello CommonProvider Provider');
  }

  public GotoBasePage() {
    this.appCtrl.getRootNav().setRoot("BasehomePage");
  }

  GotoHomePage() {

    return this.GetStorage(this.LSName_curMealName).then(curMealName => {
      if (!curMealName || curMealName.length == 0) {
        this.appCtrl.getRootNav().setRoot("NomealPage");//无餐别，停止营业
      } else {
        this.appCtrl.getRootNav().setRoot("TvhomePage");

      }
      return Promise.resolve();
    });

  }
  public ShowErrorModal(errTitle: string, msgArr, closeSecond = 30, onDidDismiss?: any) {
    let profileModal = this.modalCtrl.create("ErrorPage", { errTitle: errTitle, msgArr: msgArr, closeSecond: closeSecond });
    if (onDidDismiss != null) {
      profileModal.onDidDismiss(onDidDismiss);
    }
    profileModal.present();

    //this.appCtrl.getActiveNav().push("ErrorPage");
  }

  public Alert(msgtext: string, handler?: any, title: string = "提示", buttonText: string = "确定") {
    let alertbox = this.alertCtrl.create({
      title: title,
      subTitle: msgtext,
      enableBackdropDismiss: false, // 不允许点击弹出框背景
      buttons: [{
        text: buttonText,
        handler: () => {
          if (handler != null) handler();
        }
      }]
    });
    return alertbox.present().then(() => {
      setTimeout(() => {
        alertbox.dismiss();
      }, 30000);
    });
  }

  /**
     * 获取当前时间戳
     * @param type s(秒) ms(毫秒)
     */
  public GetTimeStamp(type: string = "s") {
    let val = (new Date).valueOf();//getTime();
    if (type.toLowerCase() == "s") val = Math.floor(val / 1000);
    return val;
  }
  /**
   * 获取时间戳
   * @param timestr 
   * @param type s(秒) ms(毫秒)
   */
  public GetTimeStampByTimeStr(timestr: string, type: string = "s") {
    let val = (new Date(timestr)).valueOf();//getTime();
    if (type.toLowerCase() == "s") val = Math.floor(val / 1000);
    return val;
  }

  public Toast(msgtext: string, position: string = "middle", duration: number = 5000) {
    let toast = this.toastCtrl.create({
      message: msgtext,
      duration: duration,
      position: position,
      //showCloseButton: true,
      //closeButtonText: 'Ok'
      // cssClass: 'my-toast my-toast-error'
    });
    return toast.present();
  }

  public GetStorage(key: string) {
    return this.storage.get(key).then(val => {
      if (key == this.LSName_APIURL) {
        if (val == null) val =AppConfig.defaultIPAddr;
        this.APIHost = val;
      }
      return Promise.resolve(val);
    });
  }

  public GetImgUrl(file: string) {
    if (file == null || file.length <= 0 || this.APIHost == null) return "assets/imgs/backg1.jpg";
    var imgurl = "http://" + this.APIHost + "/img/product/" + encodeURI(file);
    return imgurl;
  }

  /**
   * 设置Storage值
   * @param key 
   * @param value 
   */
  public SetStorage(key: string, value: any): Promise<any> {
    return this.storage.set(key, value);
  }

  GetNowFormatDate(f = 0) {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) + "";
    let day = date.getDate() + "";
    let hour = date.getHours() + "";
    let minu = date.getMinutes() + "";
    let sec = date.getSeconds() + "";
    if (month.length == 1) month = "0" + month;
    if (day.length == 1) day = "0" + day;
    if (hour.length == 1) hour = "0" + hour;
    if (minu.length == 1) minu = "0" + minu;
    if (sec.length == 1) sec = "0" + sec;
    let week = date.getDay() + "";
    if (week == "0") week = "星期日";
    else if (week == "1") week = "星期一";
    else if (week == "2") week = "星期二";
    else if (week == "3") week = "星期三";
    else if (week == "4") week = "星期四";
    else if (week == "5") week = "星期五";
    else if (week == "6") week = "星期六";

    let currentdate = year + "-" + month + "-" + day + " " + hour + ":" + minu + ":" + sec;
    if (f == 1) {
      currentdate = year + "年" + month + "月" + day + "日" + " " + week + "  " + hour + ":" + minu + ":" + sec;
      //this.common.Toast(this.strTimeNowShow);
    };

    return currentdate;
  }

  getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return r[2];//unescape(r[2]); 
    return null;
    
  }

  public GetWindowHeight() {
    return window.screen.height;
  }

  public GetWindowWidth() {
    return window.screen.width;
  }
}
