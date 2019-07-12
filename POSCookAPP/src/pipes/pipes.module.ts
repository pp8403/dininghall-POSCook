import { NgModule } from '@angular/core';
import { MomentPipe,MomentWeekPipe } from './moment/moment';
@NgModule({
	declarations: [MomentPipe,MomentWeekPipe],
	imports: [],
	exports: [MomentPipe,MomentWeekPipe]
})
export class PipesModule {}
