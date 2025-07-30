import { Component } from '@angular/core';
import { ModalController, ToastController, IonicModule } from '@ionic/angular'; // Add IonicModule
import { CommonModule } from '@angular/common'; // Add CommonModule
import { FormsModule } from '@angular/forms'; // Add FormsModule
import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-add-contact-modal',
  templateUrl: './add-contact.modal.html',
  styleUrls: ['./add-contact.modal.scss'],
  standalone: true, // <--- ADD THIS LINE
  imports: [CommonModule, IonicModule, FormsModule] // <--- ADD THIS LINE
})
export class AddContactModal {
  name = '';
  phone = '';

  constructor(
    private modalCtrl: ModalController,
    private contactService: ContactService,
    private toastCtrl: ToastController
  ) {}

  async save() {
    if (!this.name || !this.phone) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill out both fields.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    await this.contactService.saveContact({ name: this.name, phone: this.phone });
    const toast = await this.toastCtrl.create({
      message: 'Contact saved!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    this.modalCtrl.dismiss({ refresh: true });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}