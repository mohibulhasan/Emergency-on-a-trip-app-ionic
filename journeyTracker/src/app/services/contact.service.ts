import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private _storage: Storage | null = null;
  // Use a Promise to track the initialization state of the storage
  private _storageReadyPromise: Promise<void>;
  private key = 'trustedContacts';

  constructor(private storage: Storage) {
    // Start the initialization immediately when the service is instantiated.
    // This makes the service "self-initializing".
    this._storageReadyPromise = this.init();
  }

  // This method now handles the actual storage creation
  // It's marked private because other parts of your app shouldn't directly call it.
  private async init(): Promise<void> {
    this._storage = await this.storage.create();
    console.log('Storage initialized:', !!this._storage);
  }

  // Helper method to ensure _storage is ready before any operation.
  // Any method that needs to interact with _storage should await this.
  private async ensureStorageReady(): Promise<void> {
    if (!this._storage) {
      // If _storage is not yet set, wait for the initialization promise to resolve.
      await this._storageReadyPromise;
    }
  }

  async saveContact(contact: { name: string; phone: string }) {
    await this.ensureStorageReady(); // <--- Ensure storage is ready before proceeding
    const contacts = await this.getContacts(); // getContacts will also ensure storage is ready
    console.log('Existing contacts before save:', contacts);
    contacts.unshift(contact);
    await this._storage!.set(this.key, contacts); // Use '!' because we've just ensured it's not null
    console.log('Saved contact:', contact);
  }

  async getContacts(): Promise<{ name: string; phone: string }[]> {
    await this.ensureStorageReady(); // <--- Ensure storage is ready before proceeding
    const data = await this._storage!.get(this.key); // Use '!' because we've just ensured it's not null
    console.log('Fetched contacts from storage:', data);
    return data || [];
  }

  async deleteContact(contact: { name: string; phone: string }) {
    await this.ensureStorageReady(); // <--- Ensure storage is ready before proceeding
    const existing = await this.getContacts(); // getContacts will also ensure storage is ready
    const updated = existing.filter(
      (c) => c.name !== contact.name || c.phone !== contact.phone
    );
    await this._storage!.set(this.key, updated); // Use '!' because we've just ensured it's not null
    console.log('Deleted contact:', contact);
  }
}