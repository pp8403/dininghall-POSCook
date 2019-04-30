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
      let newNames = []
      res.data.lstCall.map(item => {
        let isExist = this.formValue["lstCall"].find(m => { return m.orderid == item.orderid });
        if (isExist) {
          item["class"] = "nameNormal";
        } else {
          item["class"] = "blinkAni nameNormal";
          hasNew = true;
          newNames.push(this.common.getUserCNname(item.username));
        }
      });
      if (hasNew) {
        this.playDing();
        setTimeout(() => {
          this.playVoice(newNames);
        }, 1000);
      }
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

  voicePer = 0;
  playVoice(names) {
    /*
    http://ai.baidu.com/docs#/TTS-API/top
应用名称 DiningHall
AppID 16148612
API Key zszT5NZj22NndwkaUzzDGztl
Secret Key 8PRq94NQgBm9mlx2idYzaoBmv02EAAjA
token:30天
https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=zszT5NZj22NndwkaUzzDGztl&client_secret=8PRq94NQgBm9mlx2idYzaoBmv02EAAjA
{"access_token":"24.0a7c735f7222db433268adf87ef4cee5.2592000.1559198850.282335-16148612","session_key":"9mzdC3nBs6j46lY4d073G2Y0AVhz5NCfk1HSRYuAomsDE\/V3R8uirN30qj4\/uxSggctfipnixcqq19ghmdzpsS901V2xMw==","scope":"audio_voice_assistant_get brain_enhanced_asr audio_tts_post public brain_all_scope wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test\u6743\u9650 vis-classify_flower lpq_\u5f00\u653e cop_helloScope ApsMis_fangdi_permission smartapp_snsapi_base iop_autocar oauth_tp_app smartapp_smart_game_openapi oauth_sessionkey smartapp_swanid_verify smartapp_opensource_openapi smartapp_opensource_recapi","refresh_token":"25.f68938ce495352f43a6f8d6d2a5a7847.315360000.1871966850.282335-16148612","session_secret":"b85ab8cc2bbcc453205e8dfac4878e18","expires_in":2592000}
https://tsn.baidu.com/text2audio?tex=请潘立取餐&lan=zh&cuid= 16148612&ctp=1&tok=24.0a7c735f7222db433268adf87ef4cee5.2592000.1559198850.282335-16148612
    */
    let tok = '24.0a7c735f7222db433268adf87ef4cee5.2592000.1559198850.282335-16148612';
    let spd = 4;//语速，取值0-15，默认为5中语速
    let vol = 8;//音量，取值0-15，默认为5中音量
    let per = this.voicePer;//发音人选择, 0为普通女声，1为普通男生，3为情感合成-度逍遥，4为情感合成-度丫丫，默认为普通女声
    this.voicePer = this.voicePer == 0 ? 1 : 0;//男女轮播


    let text = '';
    if (names.length == 1) text = `${names[0]},${names[0]},情取餐`;
    else if (names.length > 5) {
      for (let i = 0; i < 5; i++) {
        text += `${names[i]},`;
      }
      text += "情取餐";
      spd = 6;
    } else {
      for (let name of names) {
        text += `${name},${name},情取餐,`;
      }
      spd = 5;
    }
    var usrUext = encodeURIComponent(encodeURIComponent(text));
    var src = `https://tsn.baidu.com/text2audio?tex=${usrUext}&spd=${spd}&vol=${vol}}&per=${per}&lan=zh&cuid=16148612&ctp=1&tok=${tok}`;
    console.log(src);
    // 初始化Aduio
    var audio = new Audio();
    var playPromise;
    audio.src = src;
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
  }
}
