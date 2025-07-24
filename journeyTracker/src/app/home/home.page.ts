import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './home.page.html',
})
export class HomePage {
  lastPhoto: string | null = null;
  location: { lat: number; lng: number } | null = null;
  contactsCount: number = 0;

  constructor(private storage: Storage, private navCtrl: NavController) {}

  async ngOnInit() {
    await this.storage.create();
    this.lastPhoto = await this.storage.get('busPhoto');
    this.location = await this.storage.get('location') || { lat: null, lng: null };
    const contacts = await this.storage.get('trustedContacts');
    this.contactsCount = contacts?.length || 0;
  }

  goToCamera() {
    this.navCtrl.navigateForward('/tabs/camera', {
      animationDirection: 'forward'
    });
  }

  goToTrack() {
    this.navCtrl.navigateForward('/tabs/track', {
      animationDirection: 'forward'
    });
  }

  goToAlert() {
    this.navCtrl.navigateForward('/tabs/alert', {
      animationDirection: 'forward'
    });
  }

  goToContacts() {
    this.navCtrl.navigateForward('/contacts', {
      animationDirection: 'forward'
    });
  }
}