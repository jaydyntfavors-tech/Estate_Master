# EstateMaster: Landlord Tycoon & Property Simulator

A financial simulation and real estate strategy game built with React 19, TypeScript, Vite, and Tailwind CSS.

Start at age 18 with $1,000 in your pocket and a thin credit profile. Work your way through college or trade school, climb the career ladder, balance debt, invest in index funds, and build a passive real estate empire from starter duplexes to commercial skyscrapers.

---

## 🚀 Instant Deployment Guide

Once you send or push this repository to your GitHub, you can publish it live to the web in less than 2 minutes using any of the following options:

### Option A: Free Hosting on GitHub Pages (Zero Config)
1. In your GitHub repository, navigate to **Settings** > **Pages** (under the "Code and automation" section).
2. Under **Build and deployment** > **Source**, change from *Deploy from a branch* to **GitHub Actions**.
3. Push any commit or trigger the included `.github/workflows/deploy.yml` workflow.
4. GitHub will automatically build your app and give you a live website URL at `https://<your-username>.github.io/<repository-name>/`.

### Option B: Deploy to Vercel (Recommended)
1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New...** > **Project**.
3. Import this repository.
4. Framework Preset will automatically detect **Vite** with the included `vercel.json`.
5. Click **Deploy**. Your site will be live at `https://<project-name>.vercel.app`.

### Option C: Deploy to Netlify
1. Go to [Netlify](https://www.netlify.com/) and sign in with GitHub.
2. Click **Add new site** > **Import an existing project**.
3. Select this repository (the included `netlify.toml` pre-configures build command `npm run build` and publish directory `dist`).
4. Click **Deploy Site**.

---

## 💻 Local Development

To run and test the application on your computer:

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
```

To build for production:
```bash
npm run build
npm run preview
```

---

## 🎮 Game Features & Mechanics

- **Character Lifecycle & Age Progression**: Start at age 18. Age advances month-by-month through life phases (*Young Adult*, *Career Builder*, *Wealth Accumulation*, *Estate Tycoon*, *Pre-Retirement*, and *Mandatory Retirement at 70* with Social Security pension & Hall of Fame legacy stats).
- **Career & Higher Education**: Work entry-level jobs or enroll in degree programs (Computer Science, Pre-Med, Pharmacy, Law, Police Academy) using cash or student loans.
- **Dynamic Workplace Events**: Random multiple-choice scenarios every few months featuring bonuses, performance reviews, raises, docked pay, or layoffs.
- **FICO Credit Scoring & Debt Management**: Dynamic 300–850 credit score system influenced by credit card utilization, on-time payments, student loans, and mortgages.
- **Passive vs. Active Property Management**: Self-manage units to maximize cash flow or hire property management firms (8% fee) to completely eliminate tenant maintenance emergencies.
- **Rental Demand Heatmap**: Visual market demand vs. supply analytics across suburban, urban, luxury, and historic markets.
- **Stock & ETF Market**: Invest in index funds (V-TOTAL, S&P 500 equivalent, Tech Growth, REIT Income) with real dividend payouts.
- **April Tax Season**: Annual IRS tax liability calculations incorporating mortgage interest deductions, depreciation, student loan interest, and liquid wealth exposure.
