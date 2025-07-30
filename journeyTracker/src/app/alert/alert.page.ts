import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';

// Import Geolocation for current location
import { Geolocation } from '@capacitor/geolocation';

// Corrected import for Motion plugin and its types
import { Motion, AccelListenerEvent } from '@capacitor/motion';
import { PluginListenerHandle } from '@capacitor/core'; // Correct import for PluginListenerHandle

import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.page.html',
  styleUrls: ['./alert.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AlertPage implements OnInit, OnDestroy {
  location = { lat: 53.3498, lng: -6.2603 }; // Default location
  trustedContacts: { name: string; phone: string }[] = [];

  isMonitoringImpact: boolean = false;
  private motionWatchHandle: PluginListenerHandle | null = null; // Changed name for clarity
  public impactThreshold: number = 20; // Made public to be accessible in HTML
  private lastAcceleration: { x: number; y: number; z: number } | null = null;

  constructor(
    private contactService: ContactService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.trustedContacts = await this.contactService.getContacts();
    await this.getCurrentLocation(); // Get current location on init
    this.initMap();
    this.startImpactMonitoring(); // Start monitoring on page load
  }

  ngOnDestroy() {
    this.stopImpactMonitoring(); // Stop monitoring when leaving the page
    // Cleanup map if necessary (though Leaflet manages its own DOM element)
    const mapElement = document.getElementById('map');
    if (mapElement && window['L'] && (mapElement as any)['_leaflet_id'] !== undefined) {
      // Check if Leaflet has initialized the map on this element
      const map = window['L'].map(mapElement);
      if (map) {
        map.remove(); // Remove the map instance
        console.log('Map removed from DOM on destroy.');
      }
    }
  }

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log('Current Location:', this.location);
    } catch (error) {
      console.error('Error getting current location:', error);
      await this.showToast('Could not get current location.', 'danger');
    }
  }

  initMap() {
    if (!this.location || !document.getElementById('map')) return; // Ensure map element exists

    const L = window['L'];
    if (!L) {
      console.warn('Leaflet library not loaded.');
      return;
    }

    // Check if map already initialized on the element
    const mapElement = document.getElementById('map');
    if (mapElement && (mapElement as any)['_leaflet_id']) { // Cast to any to access _leaflet_id
        // Map already initialized, update view if needed
        const map = L.map('map'); // Get existing map instance
        map.setView([this.location.lat, this.location.lng], 13);
        // Update marker position if it exists
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            layer.setLatLng([this.location.lat, this.location.lng]);
            layer.bindPopup('You are here!').openPopup();
          }
        });
        return;
    }

    // Initialize new map if not already present
    const map = L.map('map').setView([this.location.lat, this.location.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    L.marker([this.location.lat, this.location.lng]).addTo(map)
      .bindPopup('You are here!')
      .openPopup();
  }

  async startImpactMonitoring() {
    if (this.isMonitoringImpact) return;

    try {
      // The Motion plugin's addListener method handles permissions internally for native platforms.
      // Explicit checkPermissions/requestPermissions for Motion plugin are not needed directly on the plugin object.
      // If running on web, DeviceMotionEvent.requestPermission() might be needed on iOS 13+.
      // For a Capacitor app, the native layer often handles this.

      // Using Motion.addListener for acceleration
      this.motionWatchHandle = await Motion.addListener( // Await the promise
        'accel',
        (motion: AccelListenerEvent) => { // Use AccelListenerEvent directly
          if (motion && motion.acceleration) {
            this.detectImpact(motion.acceleration);
          } else {
            console.error('Motion event or acceleration data is null.');
          }
        }
      ); // The PluginListenerHandle is assigned directly

      this.isMonitoringImpact = true;
      await this.showToast('Impact monitoring started!', 'success');
      console.log('Started impact monitoring with handle:', this.motionWatchHandle);
    } catch (error: any) {
      console.error('Error starting impact monitoring:', error);
      await this.showToast(`Failed to start impact monitoring: ${error.message}`, 'danger');
    }
  }

  async stopImpactMonitoring() {
    if (this.motionWatchHandle !== null) {
      await this.motionWatchHandle.remove(); // Use the handle to remove its specific listener
      this.motionWatchHandle = null;
      this.isMonitoringImpact = false;
      this.lastAcceleration = null; // Reset last acceleration
      await this.showToast('Impact monitoring stopped.', 'warning');
      console.log('Stopped impact monitoring.');
    }
  }

  private detectImpact(currentAcceleration: { x: number; y: number; z: number }) {
    if (!this.lastAcceleration) {
      this.lastAcceleration = currentAcceleration;
      return;
    }

    // Calculate the change in acceleration (magnitude of vector difference)
    const deltaX = currentAcceleration.x - this.lastAcceleration.x;
    const deltaY = currentAcceleration.y - this.lastAcceleration.y;
    const deltaZ = currentAcceleration.z - this.lastAcceleration.z;

    const accelerationChangeMagnitude = Math.sqrt(
      deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
    );

    // console.log('Acceleration change magnitude:', accelerationChangeMagnitude);

    if (accelerationChangeMagnitude > this.impactThreshold) {
      console.warn('!!! IMPACT DETECTED !!! Magnitude:', accelerationChangeMagnitude);
      this.triggerEmergencyAlert();
      this.stopImpactMonitoring(); // Stop monitoring after triggering to prevent multiple alerts
    }

    this.lastAcceleration = currentAcceleration;
  }

  async triggerEmergencyAlert() {
    if (this.trustedContacts.length === 0) {
      await this.showToast('No trusted contacts configured to send alert.', 'warning');
      console.warn('No trusted contacts to send alert.');
      return;
    }

    // Get the most recent location before sending the alert
    await this.getCurrentLocation();

    // Fix for Google Maps link (simplified to a generic Google Maps search for lat/lng)
    // Note: Direct image sending via wa.me is not possible.
    const mapLink = `http://maps.google.com/maps?q=${this.location.lat},${this.location.lng}`;
    const message = `🚨 EMERGENCY! I need help!\nImpact detected at my location.\nMy current location: ${mapLink}`;
    const encodedMsg = encodeURIComponent(message);

    // Take screenshot of the map (still here for potential future use with native share)
    const mapElement = document.getElementById('map');
    let imageDataUrl: string | null = null;
    if (mapElement) {
      try {
        const canvas = await html2canvas(mapElement);
        imageDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for smaller size
        console.log('📸 Screenshot captured:', imageDataUrl.substring(0, 50) + '...');
      } catch (screenshotError) {
        console.error('Failed to capture map screenshot:', screenshotError);
        await this.showToast('Failed to capture map screenshot.', 'danger');
      }
    }

    // Open WhatsApp for each contact
    this.trustedContacts.forEach(contact => {
      const phone = contact.phone.replace(/\D/g, ''); // Remove non-digits
      if (phone) {
        // As noted, wa.me only supports text.
        // For image sharing, you'd need a native share plugin.
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
      } else {
        console.warn(`Contact ${contact.name} has no valid phone number for WhatsApp.`);
      }
    });

    await this.showToast('Emergency alert sent to trusted contacts!', 'success');
    console.log('Emergency alert triggered and WhatsApp messages opened.');
  }

  // Simulate impact for testing purposes
  async simulateImpact() {
    await this.showToast('Simulating impact...', 'medium');
    console.log('Simulating impact...');
    // Directly call the alert function for simulation
    this.triggerEmergencyAlert();
  }

  async sendImmediateWhatsappToFirstContact() {
    if (this.trustedContacts.length === 0) {
      await this.showToast('No trusted contacts configured.', 'warning');
      console.warn('No trusted contacts to send immediate WhatsApp.');
      return;
    }

    const firstContact = this.trustedContacts[0];
    const phone = firstContact.phone.replace(/\D/g, '');

    if (phone) {
      await this.getCurrentLocation(); // Get latest location before sending

      const mapLink = `http://maps.google.com/maps?q=${this.location.lat},${this.location.lng}`;
      const message = `🚨 IMMEDIATE HELP NEEDED! I am sending this message from JourneyTracker.\nMy current location: ${mapLink}`;
      const encodedMsg = encodeURIComponent(message);

      window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
      await this.showToast(`Immediate alert sent to ${firstContact.name}!`, 'success');
      console.log(`Immediate WhatsApp sent to ${firstContact.name}.`);
    } else {
      await this.showToast(`The first contact (${firstContact.name}) does not have a valid phone number.`, 'danger');
      console.error(`First contact ${firstContact.name} has no valid phone number for WhatsApp.`);
    }
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