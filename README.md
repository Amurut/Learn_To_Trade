# TradeLearner Pro v2.0

**TradeLearner Pro** is a high-fidelity financial simulator designed to bridge the gap between theoretical trading knowledge and market execution. Built as a professional-grade dashboard, it allows users to practice trading **Equities**, **Options**, and **Commodities** in a risk-free, real-time environment.

**Live Demo:** [https://amurut.com/Learn_To_Trade/](https://amurut.com/Learn_To_Trade/)

---

## 🚀 Key Features

* **Multi-Asset Execution:** Real-time simulation for 15+ assets across Crypto (BTC, ETH, SOL), Blue-chip Stocks (NVDA, TSLA, AAPL), and Commodities (Gold, Silver, Crude Oil).
* **Professional Candlestick Charts:** Integrated with `lightweight-charts` to provide interactive OHLC (Open, High, Low, Close) visuals with a 20-period Moving Average overlay.
* **Derivatives Engine:** A functional Options Chain allowing users to trade Calls and Puts with dynamic strike prices calculated relative to market spot prices.
* **Advanced Tracking:** Includes a real-time Crosshair Tracker with a floating OHLC legend for precise historical analysis.
* **Responsive FinTech UI:** A custom-built dashboard using Tailwind CSS, optimized for both desktop analysis and mobile execution.
* **Educational Glossary:** Integrated slide-out sidebar explaining core concepts like Delta, Theta, and Leverage to assist learning during live simulation.

---

## 🛠️ Technical Stack

* **Frontend:** React.js (Hooks, Context API for Global State Management).
* **Build Tool:** Vite (Optimized for fast Hot Module Replacement).
* **Charting:** TradingView Lightweight Charts v5.x.
* **Styling:** Tailwind CSS (Mobile-first responsive design).
* **Animation:** Framer Motion (for smooth Sidebar and Modal transitions).
* **Simulation Engine:** Custom-built `MockDataEngine` utilizing asynchronous subscriptions to mimic WebSocket behavior for real-time price feeds.

---

## 🏗️ System Architecture

### 1. Mock Data Engine
The engine initializes a 100-minute historical window for all assets and transitions into a live "tick" mode, broadcasting updates every 2000ms to all subscribed components.

### 2. State Management
Utilizes a `GlobalStateProvider` to track:
* **Portfolio Balance:** Starting at a simulated $10,000.
* **Open Positions:** Real-time tracking of entry price, size, and side.
* **Unrealized P&L:** Calculated globally across all asset types on every market tick.

### 3. Execution Logic
A custom `useTradingLogic` hook manages the complexity of opening and closing positions, including specific settlement logic for derivatives (Options).

---

## 💻 Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Amurut/Learn_To_Trade.git](https://github.com/Amurut/Learn_To_Trade.git)
    cd Learn_To_Trade
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Build for Production:**
    ```bash
    npm run build
    ```

---

## 👨‍💻 Author

**Amurut Mathew Koshy**
*M.Tech AI/ML (BITS Pilani) | MBA (IIM Nagpur)*

* **LinkedIn:** [linkedin.com/in/amurut](https://linkedin.com/in/amurut)
* **Portfolio:** [amurut.com](https://amurut.com)