import { Component, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('audioPlay') audioPlay: ElementRef;

  formValue = new Set();

  curMealName = "";
  strTimeNowShow = "";

  interval = null;
  //timeout_getpro = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private common: CommonProvider,
    private http: HttpRequestProvider,
    private settimeout: SettimeoutProvider
  ) {
    window['TVHomePage'] = this;
    this.formValue["lstCall"] = [];
    this.formValue["lstWait"] = [];
  }

  _TouchPage(): number {
    return 1;
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.playDing();

    }, 2000);
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
    this.http.Request("getCookedOrders", { minu: 8 }).then(res => {
      let hasNew = false;
      res.data.lstCall.map(item => {
        let isExist = this.formValue["lstCall"].find(m => { return m.orderid == item.orderid });
        if (isExist) {
          item["class"] = "nameNormal";
        } else {
          item["class"] = "blinkAni nameNormal";
          hasNew = true;
        }
      });
      if (hasNew)
        this.playDing();

      //console.log(res.data.lstCall);
      this.formValue["lstCall"] = res.data.lstCall;
      this.formValue["lstWait"] = res.data.lstWait;
      this.settimeout.regAction(() => {
        this.getCookedOrders();
      }, 3000);

    }, err => {
      this.formValue["lstCall"] = [];
      this.formValue["lstWait"] = [];

      let msgArr = [];
      msgArr.push(err);
      this.common.ShowErrorModal("系统设置错误", msgArr, 20);
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

  playDing() {
    let audio: any = document.getElementById("audioPlay");
    console.log(audio);
    if(audio){
      let p=audio.play();
      if(p){
        p.then(suc=>{},err=>{
          console.log("play error", err);
        });
      }
    }
    //console.log(this.audioPlay);
    //this.audioPlay.nativeElement.play();

    // // 音频文件
    // var src = "assets/audio/ding.mp3";
    // // 初始化Aduio
    // var audio = new Audio();
    // var playPromise;
    // audio.src = src;
    // if (audio.paused) {
    //   console.log(audio);
    //   playPromise = audio.play();
    //   if (playPromise) {
    //     playPromise.then(() => {

    //     }, e => {
    //       console.log("play catch", e);
    //     });
    //   }
    // } else {
    //   audio.pause();
    // }

    // let audio: any = document.getElementById("audioPlay");

    // var body:any=document.getElementsByTagName("body" )[0];

    // if(audio){
    //   body.removeChild(audio);
    // }
    // var strAudio = "<audio id='audioPlay' src='assets/audio/ding.mp3' hidden='true'>";
    // console.log(body);
    // var node=document.createElement("audio");
    // node.id="audioPlay";
    // node.src='assets/audio/ding.mp3';
    // body.appendChild( node );
    // audio = document.getElementById( "audioPlay" );
    // audio.play();
    
  }

}
