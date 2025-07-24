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
        loadComponent: () =>
          import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'camera',
        loadComponent: () =>
          import('./camera/camera.page').then((m) => m.CameraPage),
      },
      {
        path: 'track',
        loadComponent: () =>
          import('./track/track.page').then((m) => m.TrackPage),
      },
      {
        path: 'alert',
        loadComponent: () =>
          import('./alert/alert.page').then((m) => m.AlertPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./contacts/contacts.page').then((m) => m.ContactsPage),
  },
  {
    path: 'test-camera',
    loadComponent: () =>
      import('./camera/camera.page').then((m) => m.CameraPage),
  },
];