import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'camera',
        loadComponent: () => import('./camera/camera.page').then((m) => m.CameraPage),
      },
      {
        path: 'track',
        loadComponent: () => import('./track/track.page').then((m) => m.TrackPage),
      },
      {
        path: 'contacts', // ✅ Moved inside tabs
        loadComponent: () => import('./contacts/contacts.page').then((m) => m.ContactsPage),
      },
      {
        path: 'alert',
        loadComponent: () => import('./alert/alert.page').then((m) => m.AlertPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'test-camera', // You can leave this here if it’s for dev purposes
    loadComponent: () => import('./camera/camera.page').then((m) => m.CameraPage),
  },
];