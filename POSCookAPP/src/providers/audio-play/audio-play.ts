
import { Injectable } from '@angular/core';

import { NativeAudio } from '@ionic-native/native-audio';
/*
  Generated class for the AudioPlayProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AudioPlayProvider {

  constructor(
    private nativeAudio: NativeAudio
  ) {
    this.nativeAudio.preloadComplex('BeepSuc', 'assets/audio/BeepSuc.MP3', 1, 1, 0);
    this.nativeAudio.preloadComplex('BeepFail', 'assets/audio/BeepFail.wav', 1, 1, 0);
    this.nativeAudio.preloadComplex('PaySuc', 'assets/audio/PaySuc.wav', 1, 1, 0);
  }
  
  public playBeepSucSound() {
    this.nativeAudio.play('BeepSuc');
  }
  public playBeepErrSound() {
    this.nativeAudio.play('BeepFail');
  }
  public playPaySucSound() {
    this.nativeAudio.play('PaySuc');
  }
}
