import { Component } from '@angular/core';
import { SharedIonicModule } from '../ionic.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [SharedIonicModule, CommonModule, RouterModule],
})
export class TabsPage {}