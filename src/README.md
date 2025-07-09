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

> **Why a separate project?** Using a separate project for production is a critical best practice. It protects your live user data from accidental changes during development, ensures your live app remains stable while you test new features, and allows you to enforce stricter security rules for your production environment.

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

### 3. Authorize Your Domain

- In your **production** Firebase project, go to **Authentication > Settings > Authorized domains**.
- Click **Add domain** and enter your final production domain (e.g., `www.your-app-name.com`).

### 4. Deploy Secure Firestore Rules

The `firestore.rules` file in this project has been updated with secure rules suitable for production. Deploy them to your production project using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 5. Configure for Firebase App Hosting

Your project is already configured for Firebase App Hosting, the recommended way to deploy Next.js apps to Firebase.

Open `apphosting.yaml` and replace `your-prod-project-id` with your actual production Firebase Project ID. This will automatically connect your app to Firebase Hosting.

```yaml
hosting:
  site: your-prod-project-id
```

### 6. Deploy to Firebase App Hosting

You'll use the Firebase Command Line Interface (CLI) to deploy your app.

1.  **Install the Firebase CLI** if you haven't already:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase:**
    ```bash
    firebase login
    ```

3.  **Link your local project** to your production Firebase project. Run the following command and select your production project from the list:
    ```bash
    firebase use --add
    ```

4.  **Create the App Hosting backend:** This is a one-time setup command.
    ```bash
    firebase apphosting:backends:create
    ```

5.  **Deploy your app:**
    ```bash
    firebase deploy
    ```

After deployment is complete, your application will be live on the domain provided by Firebase Hosting.
