import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';
import { SettimeoutProvider } from '../../providers/settimeout/settimeout';
import { AppConfig } from '../../app/AppConfig';

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
    private settimeout: SettimeoutProvider,
    private alertCtrl:AlertController,
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
      this.playVoice('_Test001','语音测试');
    }, 2000);
    this.common.GetStorage(this.common.LSName_curMealName).then(curMealName => this.curMealName = curMealName);
    this.common.GetStorage(this.common.LSName_machineName).then(machineName => this.formValue["machineName"] = machineName);
    this.common.GetStorage(this.common.LSName_cantingName).then(cantingName => this.formValue["cantingName"] = cantingName);


    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.strTimeNowShow = this.common.GetNowFormatDate(1);
    }, 1000);

    this.settimeout.regAction(() => {
      this.getCookedOrders(true);
    }, 100);

  }

  getCookedOrders(isFirst) {
    this.settimeout.clear();
    this.http.Request("getCookedOrders", { minu: 8 }).then(res => {
      let hasNew = false;
      let newNames = [];
      res.data.lstCall.map(item => {
        let isExist = this.formValue["lstCall"].find(m => { return m.orderid == item.orderid });
        if (isExist) {
          item["class"] = "nameNormal";
        } else {
          item["class"] = "blinkAni nameNormal";
          hasNew = true;
          newNames.push({"usercode":item.usercode,"username":this.common.getUserCNname(item.username)});
        }
      });
      if (hasNew && isFirst == false) {
          this.playDing();
          newNames.map(item=>{
            setTimeout(() => {
              this.playVoice(item.usercode,item.username);
            }, 1000);
          });
      }
      //console.log(res.data.lstCall);
      this.formValue["lstCall"] = res.data.lstCall;
      this.formValue["lstWait"] = res.data.lstWait;
      this.settimeout.regAction(() => {
        this.getCookedOrders(false);
      }, 3000);

    }, err => {
      this.formValue["lstCall"] = [];
      this.formValue["lstWait"] = [];

      let msgArr = [];
      msgArr.push(err);
      this.common.ShowErrorModal("系统设置错误", msgArr, 20);
      this.settimeout.regAction(() => {
        this.getCookedOrders(isFirst);
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
    if (audio) {
      let p = audio.play();
      if (p) {
        p.then(suc => { }, err => {
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


  playVoice(usercode,username) {
    /*
    http://172.16.73.144:1788/api/TVMealTake/?_action=AudioTakeMeal&UserCode=GLE0010320&UserName=%E6%BD%98%E7%AB%8B
    */
    if (AppConfig.enableVoiceCall == false) return;
    let promiseSrcurl=this.common.GetStorage(this.common.LSName_APIURL).then(apihost => {

      //apihost="172.16.73.140:1788";
      let srcurl=AppConfig.APIUrlFormat.replace('{url}',apihost).replace('{action}','AudioTakeMeal');
      srcurl+=`&UserCode=${encodeURIComponent(usercode)}&UserName=${encodeURIComponent(username)}`;
      return srcurl;
    });
    promiseSrcurl.then(srcurl=>{
      console.log(srcurl);
      // 初始化Aduio
      var audio = new Audio();
      var playPromise;
      audio.src = srcurl;
      if (audio.paused) {
        console.log(audio);
        playPromise = audio.play();
        if (playPromise) {
          playPromise.then(() => {

          }, e => {
            console.log("play catch", e);
          });
        }
      } else {
        audio.pause();
      }


    });
    
  }
 
}
