import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Geolocation, PositionOptions, WatchPositionCallback } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-track',
  standalone: true,
  templateUrl: './track.page.html',
  styleUrls: ['./track.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class TrackPage implements OnInit, AfterViewInit, OnDestroy {
  location: { lat: number; lng: number } | null = null;
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  isLocating: boolean = false;
  watchId: string | null = null; // To store the watch ID for continuous tracking

  private geolocationOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  private readonly LOCATION_STORAGE_KEY = 'lastLocation';

  constructor(private storage: Storage, private toastCtrl: ToastController) {}

  async ngOnInit() {
    await this.storage.create();
    const storedLocation = await this.storage.get(this.LOCATION_STORAGE_KEY);
    if (storedLocation) {
      this.location = storedLocation;
      console.log('Loaded last known location from storage:', this.location);
    }
  }

  async ngAfterViewInit() {
    if (this.location) {
      this.loadMap();
    }
    await this.getLocation();
  }

  ngOnDestroy() {
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
      console.log('Stopped watching location.');
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  async getLocation(watch: boolean = false) {
    this.isLocating = true;
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          await this.showToast('Location permission denied!', 'danger');
          this.isLocating = false;
          return;
        }
      }

      if (watch && this.watchId === null) {
        // --- FIX: Removed 'await' here ---
        this.watchId = await Geolocation.watchPosition(
          this.geolocationOptions,
          (position: any, err: any) => {
            if (position) {
              this.updateLocation(position);
            } else if (err) {
              console.error('Watch location error:', err);
              this.showToast(`Watch error: ${err.message}`, 'danger');
              this.stopWatchingLocation();
            }
          }
        );
        await this.showToast('Started continuous location tracking!', 'success');
        console.log('Started watching location with ID:', this.watchId);
      } else if (!watch) {
        const position = await Geolocation.getCurrentPosition(this.geolocationOptions);
        this.updateLocation(position);
        await this.showToast('Location refreshed!', 'success');
      }
    } catch (error: any) {
      console.error('Location error:', error);
      await this.showToast(`Location error: ${error.message}`, 'danger');
    } finally {
      if (!watch) {
        this.isLocating = false;
      }
    }
  }

  async stopWatchingLocation() {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
      await this.showToast('Stopped continuous location tracking!', 'warning');
      console.log('Stopped watching location.');
    }
    this.isLocating = false;
  }

  private async updateLocation(position: any) {
    this.location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    await this.storage.set(this.LOCATION_STORAGE_KEY, this.location);

    if (!this.map) {
      this.loadMap();
    } else {
      const newLatLng = new L.LatLng(this.location.lat, this.location.lng);
      this.map.setView(newLatLng, 15);
      if (this.marker) {
        this.marker.setLatLng(newLatLng);
      } else {
        this.marker = L.marker(newLatLng).addTo(this.map);
      }
      this.marker.bindPopup('You are here!').openPopup();
    }
    console.log('Location updated:', this.location);
    this.isLocating = false;
  }

  loadMap() {
    if (!this.location || this.map) return;

    this.map = L.map('map').setView([this.location.lat, this.location.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.location.lat, this.location.lng]).addTo(this.map)
      .bindPopup('You are here!')
      .openPopup();
    console.log('Map loaded and marker set.');
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }
}