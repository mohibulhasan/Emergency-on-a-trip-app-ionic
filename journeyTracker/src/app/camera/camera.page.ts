import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-camera',
  standalone: true,
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class CameraPage implements OnInit {
  busPhoto: string | null = null;

  constructor(private storage: Storage) {}

  async ngOnInit() {
    try {
      await this.storage.create();
      this.busPhoto = await this.storage.get('busPhoto');
    } catch (err) {
      console.error('Storage init failed:', err);
    }
  }

  async takePhoto() {
    console.log('Photo button tapped');
    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.busPhoto = 'data:image/jpeg;base64,' + image.base64String;
    await this.storage.set('busPhoto', this.busPhoto);
  }
  debug() {
  console.log('Debug tap firing');
}
}
