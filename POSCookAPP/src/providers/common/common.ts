
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { App, Loading, Modal } from 'ionic-angular';
import { AlertController, ToastController, LoadingController, ActionSheetController, ModalController } from 'ionic-angular';
import { AppConfig } from '../../app/AppConfig';


@Injectable()
export class CommonProvider {

  public LSName_curMealName = "curMealName";
  public LSName_cantingName = "cantingName";
  public LSName_machineName = "machineName";
  public LSName_APIURL = "APIURL";
  
  

  public LSName_refreshValue = "refreshValue";
  public LSName_UUID = "UUID";
  

  public APIHost: string;

  constructor(
    public storage: Storage,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public appCtrl: App
  ) {

  }

  public GotoBasePage() {
    this.appCtrl.getRootNav().setRoot('BasehomePage');
  }
  
  //判断设置跳转到首页
  GotoHomePage() {

    return this.GetStorage(this.LSName_curMealName).then(curMealName => {
      
              if(!curMealName || curMealName.length==0){
                this.appCtrl.getRootNav().setRoot("NomealPage");//无餐别，停止营业
              }else{
                this.appCtrl.getRootNav().setRoot("HomePage");
              }
              return Promise.resolve();
            
    });



  }
  public ShowErrorModal(errTitle: string, msgArr, closeSecond = 30, onDidDismiss?: any, errBeep = false) {
    let profileModal = this.modalCtrl.create("ErrorPage", { errTitle: errTitle, msgArr: msgArr, closeSecond: closeSecond, errBeep: errBeep });
    if (onDidDismiss != null) {
      profileModal.onDidDismiss(onDidDismiss);
    }
    profileModal.present();

    //this.appCtrl.getActiveNav().push("ErrorPage");
  }

  GetRandomStr(len = 10) {
    //let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let $chars = 'abcdefhijkmnprstwxyz2345678';
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }

  /**
     * 获取当前时间戳
     * @param type s(秒) ms(毫秒)
     */
  public GetTimeStamp(type: string = "s"):number {
    let val = (new Date).valueOf();//getTime();
    if (type.toLowerCase() == "s") val = Math.floor(val / 1000);
    return val;
  }
  /**
   * 获取时间戳
   * @param timestr 
   * @param type s(秒) ms(毫秒)
   */
  public GetTimeStampByTimeStr(timestr: string, type: string = "s") :number{
    let val = (new Date(timestr)).valueOf();//getTime();
    if (type.toLowerCase() == "s") val = Math.floor(val / 1000);
    return val;
  }

  public FilterSpiChar(value: string) {
    return value.replace(/['":\|&\$]/, "");
  }

  public GetWindowHeight() {
    return window.screen.height;
  }

  public GetWindowWidth() {
    return window.screen.width;
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

  /**
   * 显示对话框，没有取消按钮
   * @param msgtext 对话框内容
   * @param title 标题
   * @param buttonText 按钮文本
   */
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
   * 显示对话框，带取消按钮
   * @param msgtext 提示内容
   * @param handler 确定按钮回调
   * @param cancelHandler 取消按钮回调
   * @param title 标题
   * @param buttonText 确定按钮文本
   * @param cancalBtnText 取消按钮文本
   */

  public AlertWithCancel(msgtext: string, handler?: any, cancelHandler?: any, index?: any, title: string = "提示", buttonText: string = "确定", cancalBtnText: string = '取消') {
    let alertbox = this.alertCtrl.create({
      title: title,
      subTitle: msgtext,
      buttons: [
        {
          text: cancalBtnText,
          handler: () => {
            if (cancelHandler != null) cancelHandler();
          }
        },
        {
          text: buttonText,
          handler: () => {
            if (handler != null) handler(index);
          }
        }
      ]
    });
    return alertbox.present().then(() => {
      setTimeout(() => {
        alertbox.dismiss();
      }, 30000);
    });
  }

  /**
   * 显示对话框，带输入框
   * @param title 标题
   * @param inputs 输入框
   * @param handlerCancel 取消按钮回调
   * @param cancelBtnText 取消按钮文本
   * @param handlerOk 确定按钮回调
   * @param okBtnText 确定按钮文本
   */
  public AlertWithInput(title: string = "提示", inputs?: any, handlerCancel?: any, cancelBtnText: string = "取消", handlerOk?: any, okBtnText: string = "确定", id?: any) {
    let alertbox = this.alertCtrl.create({
      title: title,
      inputs: inputs,
      buttons: [
        {
          text: cancelBtnText,
          handler: () => {
            if (handlerCancel != null) handlerCancel();
          }
        },
        {
          text: okBtnText,
          handler: inputData => {
            if (handlerOk != null) handlerOk(id, inputData);
          }
        }
      ]
    });
    return alertbox.present().then(() => {
      setTimeout(() => {
        alertbox.dismiss();
      }, 60000);
    });
  }

  /**
   * Toast消息显示
   * @param msgtext 消息文本
   * @param position 显示位置 top|middle|bottom
   * @param duration 持续显示时间(毫秒)
   */
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

  private _loaderding: Loading;
  /**
   * 显示Loading
   * @param loadingtext loading文本
   * @param duration 自动消失时长
   */
  public LoadingShow(loadingtext: string = "Please wait...", duration: number = 0) {
    this.LoadingHide();
    this._loaderding = this.loadingCtrl.create({
      content: loadingtext,
      duration: duration
    });
    return this._loaderding.present();
  }
  public LoadingHide() {
    if (this._loaderding != null) {
      this._loaderding.dismiss();
      this._loaderding = null;
    }
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

}
