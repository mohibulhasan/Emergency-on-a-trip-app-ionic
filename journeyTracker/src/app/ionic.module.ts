// src/app/ionic.module.ts
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@NgModule({
  exports: [IonicModule],
  imports: [IonicModule.forRoot()]
})
export class SharedIonicModule {}