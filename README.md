# KBC Dream Planner

## What is it?
The Dream Planner is a personalised financial planning system that supports KBC customers in reaching their financial goals. Customers add their goals to a calendar timeline with the amount needed and a deadline. KBC turns them into a dynamic financial roadmap that tracks progress and predicts when each goal can be reached. When a goal is at risk, the app shows the consequences of each option and lets the customer choose before it recalculates the plan. At the end of the year, the planner looks back on the customer's progress.
The personalisation is based mainly on information the customer provides themselves, so the Dream Planner stays non-invasive to their privacy.

## App structure
This repository contains a clickable prototype of the customer app. In the app, goals are called "dreams".
What the prototype does
Dream schedule (Home): a month calendar where each coloured day shows something happening: autosaves, salary, planned extra money, milestones, tips and dream dates. Below it are the upcoming goals.
Add a dream: 3 steps. Pick a type (travel, home, wedding, car, study, time off), set the cost and the deadline, and see the monthly amount and milestones straight away.
Roadmap: each dream has its own savings pot with an automatic monthly transfer. The app calculates the monthly amount, the progress, and when each milestone (25/50/75/100%) will be reached.
Trade-offs: when dreams need more money per month than the customer has, the app shows the consequences of each choice. The customer can move the date of one dream (with the new date calculated) or save more each month, and the plan recalculates.
Tips: generated from the customer's own dreams and their income moments (extra money that arrives around the same time each year, like a bonus). Examples: money left over at month end, booking and insurance moments for a trip, and a reminder about unused holiday days. The customer chooses how often they are nudged.
Dreams & statistics: savings this year, a chart of the last 6 months, the monthly plan and the saving streak.
Dream Wrapped: the end-of-year recap, in 7 story slides built from the customer's numbers.
Settings: how often tips appear, bigger text, replay Wrapped, reset the demo.

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

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
