# Share-A-Meal 

Share-A-Meal is a community-driven web platform designed to bridge the gap between food donors, volunteers, and campaigns. It streamlines surplus food donation management, allows users to launch and fund agricultural/food campaigns, tracks delivery handoffs, and utilizes AI-driven analytics to maximize localized community support[cite: 1].

---

## Key Features

*   **Campaign & Donation Management:** Easily create, discover, and track active food campaigns and localized nearby donations[cite: 1].
*   **Interactive Maps & Routing:** Visualized geolocation tracking via `DonationMapView` for efficient food pickups[cite: 1].
*   **AI Chat Insights:** On-demand analytics and automated recommendations for minimizing food waste[cite: 1].
*   **Delivery & QR Handoffs:** Secure QR code verification modules for volunteers delivering meals[cite: 1].
*   **Gamified Leaderboards:** Donor and campaign milestone leaderboards to maximize community engagement[cite: 1].
*   **Localization (`i18n`):** Full multi-language support with dynamic context language switching[cite: 1].
*   **Real-time Notifications:** In-app alert dialogs and push notification settings[cite: 1].

---

## Tech Stack

*   **Frontend Framework:** React (Vite-powered, ES Modules)[cite: 1]
*   **Styling & UI Components:** Tailwind CSS & PostCSS + [shadcn/ui](https://ui.shadcn.com/) (Primitives built with Radix UI)[cite: 1]
*   **State Management & Contexts:** Native React Context (`AuthContext`, `LanguageContext`)[cite: 1]
*   **Data Fetching & Optimization:** TanStack Query (`query-client.js`)[cite: 1]
*   **Internationalization:** `i18next` (`i18n.js`)[cite: 1]

---

## Architecture Overview

```text
Share-A-Meal-main/
├── src/
│   ├── components/            # Reusable UI components (shadcn/ui custom components)
│   │   ├── accordion.jsx, alert-dialog.jsx, button.jsx, card.jsx, etc.
│   │   └── sidebar.jsx, Navbar.jsx, NotificationBell.jsx
│   ├── contexts/              # Global application states
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── features/              # Modular application engines
│   │   ├── AIChatInsights.jsx
│   │   ├── AdminCampaignPanel.jsx
│   │   ├── DeliveryHandoff.jsx
│   │   └── DonationMapView.jsx
│   ├── hooks/                 # Reusable logic hooks
│   │   ├── use-toast.jsx
│   │   └── usePushNotifications.js
│   ├── App.jsx                # Main layout and route registry
│   ├── i18n.js                # Translation bindings
│   ├── index.css              # Main Tailwind injection layer
│   └── main.jsx               # Client initialization script
├── components.json            # shadcn/ui configuration mapping
├── tailwind.config.js         # Atomic styles utility configuration
└── vite.config.js             # Bundler build parameters
