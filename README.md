# Bright Path Learning Hub

A modern, high-performance web platform for **Bright Path Learning Hub** inspired by and cloned from [Vedantu Early Learning](https://www.vedantu.com/earlylearning), built with:

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Vanilla CSS Design System with curated brand colors, responsive layouts, micro-animations, and glassmorphic cards
- **Backend**: Next.js TypeScript API Route Handlers
- **Database & ORM**: [Drizzle ORM](https://orm.drizzle.team/) configured for [Supabase](https://supabase.com/) PostgreSQL
- **Branding**: Official Bright Path Learning Hub circular logo & Business Registration No. 9840276

---

## 🌟 Features & Cloned Architecture

1. **Brand Identity & Header**:
   - Official Bright Path Learning Hub logo (`/public/logo.png`)
   - Business Registration No. 9840276 displayed in badges and seals
   - Quick "Connect with us" WhatsApp CTA + 1-Click "Book a Demo" modal trigger
   - Responsive mobile navigation drawer

2. **Hero / First Fold**:
   - Signature headline: *"Beyond textbooks, preparing kids for life."*
   - Trustpilot & Google Reviews rating badge (4.8/5 from 50,000+ parents)
   - Real-time lead capture input with country code selector (+91, +1, +44, +971, +65, etc.) and instant WhatsApp link
   - Floating interactive educational cards & logo showcase

3. **4 Key Benefits Strip**:
   - 1:1 LIVE Classes
   - Physical Worksheets Delivered to Doorstep
   - Personalized Attention
   - 100% Improvement Guarantee

4. **Flagship 1:1 Courses**:
   - **English Phonics & Reading (LKG - Grade 8)** - English Superstar
   - **Public Speaking & Communication (LKG - Grade 8)** - Superspeakers
   - **Coding & AI Classes for Kids (Grade 1 - 8)** - Supercoders
   - **Bright Math - Conceptual Mathematics (KG - Grade 8)** - Supermath

5. **The Bright Path Edge**:
   - High-quality 'Teachers by Choice'
   - Interactive & fun-filled sessions
   - *Learn, Practise, Master, Repeat* framework

6. **Parent Testimonials & Video Stories**:
   - Real parent quotes & verified child outcomes
   - Video player popup modal

7. **Shining Stars Achievers**:
   - Student success stories (Olympiad gold medalists, Trinity College London performers, SpellBee rankers)

8. **100% Outcome Guarantee**:
   - Guarantee policy for 90%+ class attendance
   - Official Academic Directorate seal & registration certificate

9. **Interactive FAQ Accordion**:
   - Comprehensive Q&A covering ages 4–14, 1-on-1 methodology, worksheets, and enrollment

10. **Curriculum Blueprint Table**:
    - SEO-optimized detailed program overview

11. **Persistent Floating Sticky Bottom Bar**:
    - Floating action bar for desktop and mobile quick demo booking

12. **Counselor & Admin Portal (`/admin`)**:
    - Dedicated internal management portal at `/admin` to inspect demo bookings, quick phone leads, parent details, and initiate 1-click WhatsApp follow-ups in real time.

---

## 🗄️ Database & Supabase Configuration

The application uses **Drizzle ORM** with **PostgreSQL (Supabase)**.

### 1. Configure `.env.local`
Open `c:\Users\PC\brightpath\.env.local` and add your Supabase connection strings:

```env
# Supabase PostgreSQL Connection String (Session / Pooler URL)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

### 2. Push Schema to Supabase
Run the following command to push tables directly to Supabase:
```bash
npx drizzle-kit push
```

*Note: The app includes an automatic fallback data store so it works immediately out of the box even before configuring your Supabase credentials!*

---

## 🚀 Running Locally

```bash
# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 📍 Official Contact & Location
- **Email**: [brightpathlearninghub6@gmail.com](mailto:brightpathlearninghub6@gmail.com)
- **Phone / WhatsApp**: [+234 806 320 2616](tel:+2348063202616)
- **WhatsApp Direct**: [Chat on WhatsApp](https://wa.me/2348063202616)
- **Facebook Page**: [Bright Path Learning Hub Facebook](https://web.facebook.com/profile.php?id=61594197483487)
- **Physical Address**: Kubwa, Abuja, Nigeria
- **Registration**: Business Name Registration No. 9840276

