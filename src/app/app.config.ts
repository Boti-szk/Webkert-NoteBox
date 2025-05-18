import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: "angularnotecreateapp",
        appId: "1:574974190605:web:8cb3bc7a678bdbd3a6e144",
        storageBucket: "angularnotecreateapp.firebasestorage.app",
        apiKey: "AIzaSyD1XgFmrXqYPYlW1SAGzZdOHzEPcYr6_i4",
        authDomain: "angularnotecreateapp.firebaseapp.com",
        messagingSenderId: "574974190605",
        measurementId: "G-ZXC52PF45B"
      })),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore())
    ]
};