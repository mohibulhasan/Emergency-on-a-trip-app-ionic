import { Component, AfterViewInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-track',
  standalone: true,
  templateUrl: './track.page.html',
  styleUrls: ['./track.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class TrackPage implements AfterViewInit {
  location: { lat: number; lng: number } | null = null;
  map: L.Map | null = null;

  constructor(private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    await this.getLocation();
  }

  ngAfterViewInit() {
    if (this.location) this.loadMap();
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      await this.storage.set('location', this.location);
      if (this.map) {
        this.map.setView([this.location.lat, this.location.lng], 15);
        L.marker([this.location.lat, this.location.lng]).addTo(this.map);
      } else {
        this.loadMap();
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  }

  loadMap() {
    if (!this.location) return;

    this.map = L.map('map').setView([this.location.lat, this.location.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([this.location.lat, this.location.lng]).addTo(this.map)
      .bindPopup('You are here!')
      .openPopup();
  }
}