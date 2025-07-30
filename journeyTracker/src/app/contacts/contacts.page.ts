import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  IonicModule,
  ToastController,
  ModalController,
} from '@ionic/angular';

// --- FIX 1: Import Contact interface/type explicitly ---
import { Contacts, Contact } from '@awesome-cordova-plugins/contacts/ngx'; // <--- VERIFY/ADD 'Contact' HERE
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { ContactService } from '../services/contact.service';
import { AddContactModal } from './add-contact.modal';

@Component({
  selector: 'app-contacts',
  standalone: true,
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
  providers: [
    Contacts,
    AndroidPermissions,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    AddContactModal,
  ],
})
export class ContactsPage implements OnInit {
  contactList: Contact[] = []; // Type 'Contact' is now recognized
  filteredContacts: Contact[] = []; // Type 'Contact' is now recognized
  savedContacts: { name: string; phone: string }[] = [];
  searchTerm: string = '';

  // --- FIX 2: Remove duplicate declaration ---
  showSavedContacts = true;

  constructor(
    private contactsPlugin: Contacts,
    private contactService: ContactService,
    private androidPermissions: AndroidPermissions,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}

  async openAddContactForm() {
    const modal = await this.modalCtrl.create({
      component: AddContactModal,
    });

    modal.onDidDismiss().then(async ({ data }) => {
      if (data?.refresh) {
        this.savedContacts = await this.contactService.getContacts();
      }
    });

    await modal.present();
  }

  async ngOnInit() {
    await this.checkPermissions();
    this.savedContacts = await this.contactService.getContacts();
    console.log('Saved contacts on init:', this.savedContacts);
  }

  async checkPermissions() {
    try {
      const result = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.READ_CONTACTS
      );

      if (!result.hasPermission) {
        const granted = await this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.READ_CONTACTS
        );

        if (!granted.hasPermission) {
          const toast = await this.toastCtrl.create({
            message: 'Permission to access contacts was denied.',
            duration: 2500,
            color: 'danger',
          });
          await toast.present();
        }
      }
    } catch (error) {
      console.error('Error checking/requesting permissions:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error handling contact permissions.',
        duration: 2500,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async fetchContacts() {
    try {
      // Ensure 'Contact' type is correctly imported from '@awesome-cordova-plugins/contacts/ngx'
      const deviceContacts: Contact[] = await this.contactsPlugin.find(
        ['displayName', 'phoneNumbers'],
        { multiple: true, hasPhoneNumber: true }
      );

      this.contactList = deviceContacts.filter(
        (c) => c.displayName && c.phoneNumbers?.length
      );
      this.filteredContacts = [...this.contactList];
      console.log('Loaded device contacts:', this.contactList);
    } catch (err) {
      console.error('Failed to access phone contacts', err);
      const toast = await this.toastCtrl.create({
        message: 'Could not fetch phone contacts. Ensure permissions are granted.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  filterContacts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contactList.filter((contact) =>
      contact.displayName?.toLowerCase().includes(term)
    );
  }

  async saveContact(contact: Contact) { // Type 'Contact' is now recognized
    const name = contact.displayName || 'Unnamed';
    const phone = contact.phoneNumbers?.[0]?.value || 'Unknown';
    await this.contactService.saveContact({ name, phone });
    this.savedContacts = await this.contactService.getContacts();

    const toast = await this.toastCtrl.create({
      message: `Saved ${name} to trusted contacts.`,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  async deleteContact(contact: { name: string; phone: string }) {
    await this.contactService.deleteContact(contact);
    this.savedContacts = await this.contactService.getContacts();

    const toast = await this.toastCtrl.create({
      message: `Deleted ${contact.name}`,
      duration: 2000,
      color: 'medium',
    });
    await toast.present();
  }

  toggleSavedContacts() {
    this.showSavedContacts = !this.showSavedContacts;
  }
}