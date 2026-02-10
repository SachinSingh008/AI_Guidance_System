# Career Spark AI - Quick Reference Guide

## 🚀 Tech Stack at a Glance

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 5.4.19 | Build Tool |
| Tailwind CSS | 3.4.17 | Styling |
| React Router | 6.30.1 | Routing |
| shadcn/ui | Latest | Components |
| React Query | 5.83.0 | Data Fetching |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase | BaaS (Auth + Database + Functions) |
| PostgreSQL | Database |
| Deno | Edge Functions Runtime |
| Google Gemini 2.5 Flash | AI Model |

### Mobile
| Technology | Purpose |
|------------|---------|
| Capacitor | Cross-platform wrapper |

---

## 📁 Project Structure

```
career-spark-ai-31-main/
├── src/
│   ├── pages/
│   │   ├── Index.tsx          # Landing page
│   │   ├── Auth.tsx           # Sign in/up
│   │   ├── Onboarding.tsx     # Profile setup
│   │   └── Results.tsx        # Career recommendations
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts      # Supabase client
│   │       └── types.ts       # Database types
│   └── App.tsx                # Main app component
├── supabase/
│   ├── functions/
│   │   └── generate-career-recommendations/
│   │       └── index.ts       # AI Edge Function
│   └── migrations/
│       └── *.sql              # Database schema
├── android/                   # Android app
├── package.json
├── vite.config.ts
└── capacitor.config.ts
```

---

## 🔄 User Flow

```
Landing Page (/)
    ↓
Authentication (/auth)
    ↓
Onboarding (/onboarding)
    ├─ Step 1: Basic Info
    ├─ Step 2: Skills
    └─ Step 3: Interests
    ↓
Results (/results)
    ├─ Load existing recommendations OR
    └─ Generate new (AI Edge Function)
```

---

## 🗄️ Database Schema

### Tables
1. **user_profiles** - User basic information
2. **user_skills** - User skills with levels
3. **user_interests** - User interests
4. **career_recommendations** - AI-generated recommendations

### Relationships
```
auth.users (1) ──→ (1) user_profiles
user_profiles (1) ──→ (N) user_skills
user_profiles (1) ──→ (N) user_interests
user_profiles (1) ──→ (N) career_recommendations
```

---

## 🔑 Key API Endpoints

### Supabase Client Methods
```typescript
// Authentication
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()

// Database
supabase.from("user_profiles").insert({...})
supabase.from("user_skills").select("*")
supabase.from("career_recommendations").select("*")

// Edge Functions
supabase.functions.invoke("generate-career-recommendations", { body: {...} })
```

---

## 🎨 UI Components Used

- **Button** - Actions and CTAs
- **Card** - Content containers
- **Input** - Form inputs
- **Select** - Dropdowns
- **Badge** - Tags and labels
- **Progress** - Loading indicators
- **Toast** - Notifications (Sonner)
- **Tabs** - Tabbed interfaces

---

## 🔐 Security

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - API keys protection
- **CORS Headers** - Cross-origin security

---

## 📱 Mobile App

- **Platform**: Android (iOS ready)
- **App ID**: `AIGuide.BE.com`
- **Build**: Capacitor wraps `dist/` folder
- **Native Features**: Access to device APIs

---

## 🚀 Deployment Checklist

- [ ] Set environment variables
- [ ] Build frontend: `npm run build`
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Configure Supabase project
- [ ] Deploy Edge Functions
- [ ] Test authentication flow
- [ ] Test AI recommendations
- [ ] Build mobile app (if needed)

---

## 🐛 Common Issues & Solutions

### Issue: "LOVABLE_API_KEY is not configured"
**Solution**: Set environment variable in Supabase Edge Function settings

### Issue: "Rate limit exceeded"
**Solution**: AI Gateway has rate limits, implement retry logic

### Issue: "User not authenticated"
**Solution**: Check Supabase auth session, redirect to `/auth`

### Issue: "No recommendations found"
**Solution**: Check Edge Function logs, verify AI Gateway response

---

## 📊 Data Flow Example

```
User Input (Onboarding)
    ↓
Save to Database (user_profiles, user_skills, user_interests)
    ↓
Call Edge Function (generate-career-recommendations)
    ↓
Edge Function calls AI Gateway (Gemini 2.5 Flash)
    ↓
AI returns JSON recommendations
    ↓
Save to Database (career_recommendations)
    ↓
Display in Results Page
```

---

## 🎯 Key Features

✅ AI-powered career recommendations  
✅ Skill gap analysis  
✅ Course recommendations  
✅ Career roadmaps  
✅ Multi-branch support  
✅ User profile management  
✅ Mobile app support  

---

## 📚 Important Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component, routing |
| `src/pages/Results.tsx` | Career recommendations display |
| `supabase/functions/.../index.ts` | AI recommendation generation |
| `supabase/migrations/*.sql` | Database schema |
| `capacitor.config.ts` | Mobile app config |
| `vite.config.ts` | Build configuration |

---

## 🔧 Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Create .env file with:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_key

# 3. Start dev server
npm run dev

# 4. Open http://localhost:8080
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Capacitor**: https://capacitorjs.com

---

**Last Updated**: Based on current codebase analysis

