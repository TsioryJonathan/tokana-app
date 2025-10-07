# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Setup (Environment Variables)

This app uses Expo public env variables. Create a `.env` file in `client/` based on `.env.example`.

Important:

- `EXPO_PUBLIC_*` variables are embedded in the client and are PUBLIC. Do not put secrets here.
- For native builds (EAS), you can override env vars per build profile in `eas.json` under the `env` section.

Example `.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
EXPO_PUBLIC_MAPBOX_TOKEN=pk.YOUR_MAPBOX_PUBLIC_TOKEN
```

Usage in code:

```ts
const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
```

Run the app:

```bash
npm install
npx expo start
```

If testing on a real device in development, ensure your API is reachable over LAN and set `EXPO_PUBLIC_API_BASE_URL` accordingly (e.g. `http://<your-computer-LAN-IP>:5000`).
