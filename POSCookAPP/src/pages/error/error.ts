import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AudioPlayProvider } from '../../providers/audio-play/audio-play';
import { CommonProvider } from '../../providers/common/common'
/**
 * Generated class for the ErrorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-error',
  templateUrl: 'error.html',
})
export class ErrorPage {
  errTitle: string;
  msgArr: any;
  closeSecond: number;
  private interval = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,
    private audio: AudioPlayProvider,
    private common: CommonProvider,
  ) {
    this.errTitle = navParams.get("errTitle");
    this.msgArr = navParams.get("msgArr");
    this.closeSecond = navParams.get("closeSecond");
    if (navParams.get("errBeep") === true)
      setTimeout(() => {
        audio.playBeepErrSound();
      }, 200);
  }

  ionViewDidEnter() {
    this.cutTimeShow();

  }

  ionViewWillLeave() {
    // 清除定时器
    clearTimeout(this.interval);
    this.closeSecond=3;
  }

  cutTimeShow() {
    this.interval = setTimeout(() => {
      if (this.closeSecond <= 1) {
        //this.common.GotoHomePage();
        this.viewCtrl.dismiss();
      } else {
        this.closeSecond--;
        this.cutTimeShow();
      }
    }, 1000);
  }

}
