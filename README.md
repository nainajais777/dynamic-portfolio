                                      Dynamic Portfolio Dashboard

A dynamic portfolio dashboard built with Next.js, React, TailwindCSS, and Express.js, allowing users to visualize their stock investments in real time. The app reads data from an Excel file, fetches stock information from Yahoo Finance, calculates gains/losses, portfolio percentages, and displays sector-wise summaries.

*Features :

a) Reads portfolio data from an Excel file.
b) Fetches current stock prices and financial metrics using Yahoo Finance API.
c) Groups stocks by sector and calculates:
d)Total investment per sector
e)Present value
f)Gain/Loss
g)Portfolio percentage per stock
h)Responsive and interactive dashboard with React and TailwindCSS.
i)Auto-refreshes data every 15 seconds.
j)Handles invalid symbols and errors gracefully.
k)Uses ESLint for code quality and consistency.

*Tech Stack
  *Frontend
        Technology	Version
        Next.js	16.0.1
        React / React-DOM	19.2.0
        TailwindCSS	4
  *Backend
        Technology	Version
        Node.js	20
        Express.js	5.1.0
        convert-excel-to-json	1.7.0
        Yahoo Finance 2	3.10.1
        CORS	2.8.5
    dynamic-portfolio/
│
├─ app/                  # Next.js frontend
│  ├─ components/
│  │  └─ PortfolioTable.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ public/               # Static assets
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  └─ window.svg
│
├─ server/               # Backend API
│  └─ portfolio.js
│
├─ node_modules/
├─ package.json
├─ package-lock.json
├─ next.config.ts
├─ tsconfig.json
├─ postcss.config.mjs
├─ eslint.config.mjs
└─ README.md

*Installation
a)git clone https://github.com/yourusername/dynamic-portfolio.git
cd dynamic-portfolio

*Install dependencies:
npm install

*Ensure the Excel file exists and update the path in server/portfolio.js:
const filePath = "/home/naina/Downloads/sample.xlsx";

*Backend
Start the Express server:
node server/portfolio.js

*Endpoint:
GET /portfolio

*Returns JSON:
results → array of stock objects
sectorSummary → totals per sector

*Frontend
Start Next.js development server:
[root@vbox dynamic-portfolio]$ npm run dev

*Open in browser: http://localhost:3000
a)Dashboard displays:
b)Sector-wise stock table
c)Investment, CMP, Gain/Loss, Portfolio %
d)P/E Ratio and Latest EPS
e)Auto-refresh every 15 seconds

*ESLint (Code Quality)
The project uses ESLint to maintain clean and consistent code.
npm run lint

*Data Flow Diagram
+----------------+       +-----------------+       +------------------+
|                |       |                 |       |                  |
|   Excel File   |  -->  |   Express.js    |  -->  |   Next.js +      |
| (sample.xlsx)  |       |   Backend API   |       |   React Frontend |
|                |       |   /portfolio    |       |   Dashboard      |
+----------------+       +-----------------+       +------------------+
        |                        |                        |
        | Read & parse            | Fetch Yahoo Finance    |
        | (convert-excel-to-json) | & calculate metrics   |
        |                        |                        |
        +------------------------+------------------------+
                                 |
                                 v
                        JSON response with:
                  - Stock data (CMP, P/E, gain/loss)
                  - Sector summaries
*Configuration
a)Excel File Path: Update filePath in server/portfolio.js.
b)Refresh Interval: In PortfolioTable.tsx (default 15000 ms).

*Screenshot
/home/naina/dynamic-portfolio/screenshot