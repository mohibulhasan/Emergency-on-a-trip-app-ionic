import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

import { Contacts, Contact } from '@awesome-cordova-plugins/contacts/ngx';

@Component({
  selector: 'app-contacts',
  standalone: true,
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class ContactsPage {
  contactList: Contact[] = [];
  savedContacts: { name: string; phone: string }[] = [];

  constructor(private contactsPlugin: Contacts, private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    const stored = await this.storage.get('trustedContacts');
    this.savedContacts = stored || [];
  }

  async fetchContacts() {
    try {
      const deviceContacts = await this.contactsPlugin.find(
        ['displayName', 'phoneNumbers'],
        {
          multiple: true,
          hasPhoneNumber: true,
        }
      );

      this.contactList = deviceContacts.filter(
        (c) => c.displayName && c.phoneNumbers?.length
      );
    } catch (err) {
      console.error('Failed to access contacts', err);
    }
  }

  async saveContact(contact: Contact) {
    const name = contact.displayName || 'Unnamed';
    const phone = contact.phoneNumbers?.[0]?.value || 'Unknown';

    const exists = this.savedContacts.some(
      (c) => c.name === name && c.phone === phone
    );

    if (!exists) {
      this.savedContacts.push({ name, phone });
      await this.storage.set('trustedContacts', this.savedContacts);
    }
  }
}