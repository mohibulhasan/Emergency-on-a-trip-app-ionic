import { Component, OnInit, NgZone } from '@angular/core';
import { SharedIonicModule } from './ionic.module';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedIonicModule], // RouterOutlet is typically provided by SharedIonicModule/IonicModule
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private platform: Platform,
    private zone: NgZone // For forcing DOM updates within Angular's zone
  ) {}

  ngOnInit() {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      // Programmatic navigation (keep this as it helps Ionic's router lifecycle)
      if (this.router.url !== '/tabs/home') {
        this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
        console.log('--- DIAGNOSTIC: Programmatic navigation to /tabs/home triggered. ---');
      } else {
        console.log('--- DIAGNOSTIC: Already on /tabs/home, no navigation needed. ---');
      }

      // --- START DIAGNOSTIC CODE: FORCING VISIBILITY (with a slight delay) ---
      // This section is now delayed to give Ionic a moment to apply its initial classes.
      setTimeout(() => { // <--- THIS setTimeout BLOCK IS CRITICAL
        this.zone.run(() => {
          const ionApp = document.querySelector('ion-app');
          if (ionApp) {
            // Find ALL elements with ion-page-invisible or ion-page-hidden classes within ion-app
            const invisiblePages = ionApp.querySelectorAll('.ion-page-invisible, .ion-page-hidden');

            if (invisiblePages.length > 0) {
              console.log(`--- DIAGNOSTIC: (Delayed) Found ${invisiblePages.length} invisible page elements. ---`);
              invisiblePages.forEach((pageEl: Element) => {
                console.log('Forcing visibility for element:', pageEl.tagName, pageEl.classList.value);
                pageEl.classList.remove('ion-page-invisible');
                pageEl.classList.remove('ion-page-hidden');
                const HTMLElementPage = pageEl as HTMLElement;
                HTMLElementPage.style.setProperty('opacity', '1', 'important');
                HTMLElementPage.style.setProperty('visibility', 'visible', 'important');
                HTMLElementPage.style.setProperty('transform', 'none', 'important');
                HTMLElementPage.style.setProperty('position', 'relative', 'important');
                HTMLElementPage.style.setProperty('z-index', '1', 'important');
              });
              console.log('--- DIAGNOSTIC: (Delayed) Visibility force applied to all found invisible pages. ---');
            } else {
              console.warn('--- DIAGNOSTIC: (Delayed) ion-app found, but NO invisible pages after delay. ---');
            }

            // Additionally, ensure the main ion-router-outlet is visible (from previous attempt, good to keep as a fallback)
            const mainRouterOutlet = ionApp.querySelector('ion-router-outlet');
            if (mainRouterOutlet) {
              console.log('--- DIAGNOSTIC: (Delayed) Ensuring main ion-router-outlet is visible. ---');
              mainRouterOutlet.classList.remove('ion-page-invisible');
              mainRouterOutlet.classList.remove('ion-page-hidden');
              const HTMLElementOutlet = mainRouterOutlet as HTMLElement;
              HTMLElementOutlet.style.setProperty('opacity', '1', 'important');
              HTMLElementOutlet.style.setProperty('visibility', 'visible', 'important');
              HTMLElementOutlet.style.setProperty('transform', 'none', 'important');
              HTMLElementOutlet.style.setProperty('position', 'relative', 'important');
              HTMLElementOutlet.style.setProperty('z-index', '1', 'important');
            }

          } else {
            console.warn('--- DIAGNOSTIC: (Delayed) ion-app element not found in the DOM. ---');
          }
        });
      }, 500); // <-- Increased to 500ms to give it more time.
      // --- END DIAGNOSTIC CODE ---

      // If you have Splash Screen and StatusBar plugins and want to hide them here:
      // import { SplashScreen } from '@capacitor/splash-screen';
      // import { StatusBar, Style } => '@capacitor/status-bar';
      // SplashScreen.hide();
      // StatusBar.setStyle({ style: Style.Default });
    });
  }
}