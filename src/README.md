# Figerout: AI Color Vision

This is a Next.js application called Figerout: AI Color Vision, built with Firebase Studio.

It allows users to capture colors from their environment using their device's camera, explore color palettes, and share their discoveries. The project also includes an admin dashboard with AI-powered content generation features.

To get started, run `npm install` and then `npm run dev`.

---

## Deployment to Production

Follow these steps to deploy your application to a production environment.

### 1. Create a Production Firebase Project

It's a best practice to use a separate Firebase project for production.
- Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
- In the new project, enable the services you need:
    - **Authentication**: Enable `Email/Password` and `Email link (passwordless sign-in)`.
    - **Firestore**: Create a new database in **Production mode**.

### 2. Configure Environment Variables

Create a `.env.local` file in your project root for your production keys. This file should not be committed to source control.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

# If you use the Pexels API for image search
PEXELS_API_KEY=your_pexels_api_key
```

You must also add these environment variables to your hosting provider's settings (e.g., Vercel, Netlify, Firebase App Hosting).

### 3. Authorize Your Domain

- In your **production** Firebase project, go to **Authentication > Settings > Authorized domains**.
- Click **Add domain** and enter your final production domain (e.g., `www.your-app-name.com`).

### 4. Deploy Secure Firestore Rules

The `firestore.rules` file in this project has been updated with secure rules suitable for production. Deploy them to your production project using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 5. Build and Deploy Your App

- Run the build command:
  ```bash
  npm run build
  ```
- Deploy the application to your hosting provider of choice.
