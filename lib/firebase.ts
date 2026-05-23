"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

let cachedApp: FirebaseApp | null = null;
let cachedDb: Database | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_DATABASE_URL is not set — copy .env.local.example to .env.local",
    );
  }
  const config = {
    databaseURL,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  cachedApp = getApps().length ? getApp() : initializeApp(config);
  return cachedApp;
}

export function getDb(): Database {
  if (cachedDb) return cachedDb;
  cachedDb = getDatabase(getFirebaseApp());
  return cachedDb;
}
