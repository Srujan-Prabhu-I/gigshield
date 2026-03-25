# GigShield

> **India's First Gig Worker Rights and Wage Transparency Platform.**

Built for the NYXORA MREM 2K26 Hackathon, GigShield empowers gig workers (delivery partners, drivers, service professionals) to understand their legal rights, calculate their actual wages versus operational deficits, and take actionable steps under the Telangana Gig and Platform Workers Act 2025.

![GigShield Demo](public/demo-banner.png)

## 🚀 Features

- **Worker Checker:** A comprehensive underpayment calculator that processes daily hours, trips, and gross pay against the legal minimum wage (₹93/hr).
- **Live Exploitation Index:** A Supabase Realtime-powered leaderboard exposing the platforms with the highest average monthly wage deficits.
- **Labour Dashboard:** An aggregation portal for government officials to track exploitation hotspots and export PDF reports instantly.
- **Collective Grievance System (AI):** An automated Groq-LLaMA powered legal drafting tool that turns worker inputs into legally rigorous complaint letters to the Labour Commissioner.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL, Realtime subscriptions)
- **AI Integration:** Groq SDK (llama-3.3-70b-versatile)
- **Styling UI:** Tailwind CSS, shadcn/ui, FormKit AutoAnimate
- **Analytics:** Recharts
- **PDF Generation:** jsPDF

## 💻 Running Locally

### Prerequisites
Make sure you have Node.js 18+ installed.

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Srujan-Prabhu-I/gigshield.git
   cd gigshield
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
   GROQ_API_KEY=your-groq-api-key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 The Problem It Solves
Over **15 million gig workers** in India currently operate without formal wage protections. Platforms classify them as independent contractors, obscuring the fact that once you factor in petrol, maintenance, and unpaid wait times, their actual take-home pay falls far below the legal minimum wage. GigShield makes this invisible exploitation mathematical, undeniable, and actionable.
