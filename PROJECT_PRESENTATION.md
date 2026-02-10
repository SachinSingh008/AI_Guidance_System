# Career Spark AI - Complete Project Presentation

## 🎯 Project Overview

**Career Spark AI** (also known as **AI Guide** or **CareerGuide AI**) is an intelligent career guidance platform designed specifically for engineering students. The application uses AI-powered recommendations to help students discover personalized career paths based on their engineering branch, skills, interests, and academic year.

### Core Purpose
- Provide personalized career recommendations for engineering students
- Identify skill gaps and suggest learning resources
- Create step-by-step roadmaps from student to professional
- Support multiple engineering branches (Computer, Mechanical, Civil, Electrical, Electronics)

---

## 🏗️ Technology Stack

### **Frontend Technologies**

#### 1. **React 18.3.1** (UI Framework)
- Modern, component-based JavaScript library
- Enables reusable UI components
- Efficient virtual DOM rendering

#### 2. **TypeScript 5.8.3** (Programming Language)
- Type-safe JavaScript
- Better code quality and IDE support
- Reduces runtime errors

#### 3. **Vite 5.4.19** (Build Tool & Dev Server)
- Lightning-fast development server
- Optimized production builds
- Hot Module Replacement (HMR) for instant updates
- **Port**: 8080

#### 4. **React Router DOM 6.30.1** (Routing)
- Client-side routing
- Navigation between pages without page reloads
- Routes:
  - `/` - Landing page
  - `/auth` - Authentication
  - `/onboarding` - User profile setup
  - `/results` - Career recommendations

#### 5. **Tailwind CSS 3.4.17** (Styling Framework)
- Utility-first CSS framework
- Responsive design
- Custom color scheme with CSS variables
- Dark mode support

#### 6. **shadcn/ui** (Component Library)
- High-quality React components built on Radix UI
- Accessible and customizable
- Components used:
  - Buttons, Cards, Forms, Dialogs
  - Badges, Progress bars, Tabs
  - Toast notifications (Sonner)

#### 7. **Radix UI** (Headless UI Primitives)
- Unstyled, accessible components
- Used as foundation for shadcn/ui components
- Examples: Dialog, Dropdown, Select, Toast

#### 8. **React Hook Form 7.61.1** (Form Management)
- Performant form handling
- Validation with Zod
- Minimal re-renders

#### 9. **Zod 3.25.76** (Schema Validation)
- TypeScript-first schema validation
- Runtime type checking

#### 10. **TanStack React Query 5.83.0** (Data Fetching)
- Server state management
- Caching and synchronization
- Automatic refetching

#### 11. **Lucide React 0.462.0** (Icons)
- Beautiful, consistent icon library
- Tree-shakeable icons

---

### **Backend Technologies**

#### 1. **Supabase** (Backend-as-a-Service)
- **Authentication**: Email/password authentication
- **Database**: PostgreSQL (managed)
- **Edge Functions**: Serverless functions (Deno runtime)
- **Real-time**: Built-in real-time subscriptions
- **Storage**: File storage capabilities
- **Row Level Security (RLS)**: Database-level security

#### 2. **Supabase Edge Functions** (Serverless Backend)
- **Runtime**: Deno
- **Function**: `generate-career-recommendations`
- **Purpose**: AI-powered career recommendation generation
- **Language**: TypeScript

#### 3. **Lovable AI Gateway** (AI Service)
- **Model**: Google Gemini 2.5 Flash
- **Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`
- **Purpose**: Generates personalized career recommendations
- **Temperature**: 0.7 (balanced creativity)

---

### **Database (PostgreSQL via Supabase)**

#### **Database Schema**

##### 1. **user_profiles** Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- full_name: TEXT
- branch: ENUM (computer, mechanical, civil, electrical, electronics)
- current_year: INTEGER (1-4)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

##### 2. **user_skills** Table
```sql
- id: UUID (Primary Key)
- profile_id: UUID (Foreign Key → user_profiles)
- skill_name: TEXT
- skill_level: ENUM (beginner, intermediate, advanced, expert)
- created_at: TIMESTAMPTZ
```

##### 3. **user_interests** Table
```sql
- id: UUID (Primary Key)
- profile_id: UUID (Foreign Key → user_profiles)
- interest: TEXT
- created_at: TIMESTAMPTZ
```

##### 4. **career_recommendations** Table
```sql
- id: UUID (Primary Key)
- profile_id: UUID (Foreign Key → user_profiles)
- career_path: TEXT
- description: TEXT
- required_skills: TEXT[] (Array)
- skill_gaps: TEXT[] (Array)
- recommended_courses: JSONB
- roadmap: JSONB
- match_score: INTEGER (0-100)
- created_at: TIMESTAMPTZ
```

#### **Security Features**
- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: Users can only access their own data
- **Cascade Deletes**: Automatic cleanup when user/profile deleted

---

### **Mobile App (Android)**

#### **Capacitor 7.4.3** (Cross-Platform Framework)
- Wraps web app as native mobile app
- **App ID**: `AIGuide.BE.com`
- **App Name**: `AI_Guide`
- **Platform**: Android (iOS support possible)
- **Build Directory**: `dist/`

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Mobile)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │         React Frontend (TypeScript)              │   │
│  │  - Pages: Index, Auth, Onboarding, Results       │   │
│  │  - Components: shadcn/ui components              │   │
│  │  - State: React Query, React Hooks              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE BACKEND SERVICES                    │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │   Authentication │  │    PostgreSQL Database      │  │
│  │   - Email/Pass   │  │    - user_profiles          │  │
│  │   - JWT Tokens   │  │    - user_skills            │  │
│  │   - Sessions     │  │    - user_interests         │  │
│  └──────────────────┘  │    - career_recommendations │  │
│                        └────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Edge Functions (Deno Runtime)              │   │
│  │  generate-career-recommendations                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API Call
                          ▼
┌─────────────────────────────────────────────────────────┐
│              LOVABLE AI GATEWAY                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │     Google Gemini 2.5 Flash                      │   │
│  │     - Career Analysis                            │   │
│  │     - Recommendation Generation                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Application Flow

### **1. Landing Page (`/`)**
- **Purpose**: Introduction and feature showcase
- **Features**:
  - Hero section with call-to-action
  - Feature cards (AI Recommendations, Skill Gap Analysis, etc.)
  - Auto-redirects authenticated users to appropriate page

### **2. Authentication (`/auth`)**
- **Features**:
  - Sign In (existing users)
  - Sign Up (new users)
  - Email/password authentication via Supabase
  - Form validation with React Hook Form

### **3. Onboarding (`/onboarding`)**
- **Multi-step Form** (3 steps):
  - **Step 1**: Basic Information
    - Full Name
    - Engineering Branch (dropdown)
    - Current Year (1-4)
  - **Step 2**: Skills
    - Add skills with proficiency levels
    - Dynamic skill badges
  - **Step 3**: Interests
    - Add career interests
    - Tag-based input

- **Data Storage**: Saves to `user_profiles`, `user_skills`, `user_interests`

### **4. Results (`/results`)**
- **Features**:
  - Displays personalized career recommendations
  - Shows match scores (0-100%)
  - Required skills list
  - Skill gaps identification
  - Recommended courses with platforms
  - Step-by-step career roadmap
  - Can regenerate recommendations

---

## 🔄 Data Flow Example

### **Scenario: New User Journey**

```
1. User visits landing page (/)
   └─> Not authenticated → Shows hero page

2. User clicks "Get Started" → Navigates to /auth
   └─> Signs up with email/password
   └─> Supabase creates auth user
   └─> Redirects to /

3. Landing page detects authenticated user
   └─> Checks for profile in database
   └─> No profile found → Redirects to /onboarding

4. User completes onboarding form
   └─> Step 1: Name, Branch, Year → Saved to user_profiles
   └─> Step 2: Skills → Saved to user_skills
   └─> Step 3: Interests → Saved to user_interests
   └─> Redirects to /results

5. Results page loads
   └─> Checks for existing recommendations
   └─> None found → Calls Edge Function

6. Edge Function: generate-career-recommendations
   └─> Receives: profile, skills, interests
   └─> Formats prompt for AI
   └─> Calls Lovable AI Gateway (Gemini 2.5 Flash)
   └─> Receives JSON with 3 career recommendations
   └─> Saves to career_recommendations table
   └─> Returns recommendations to frontend

7. Frontend displays recommendations
   └─> Shows career paths with match scores
   └─> Displays required skills, gaps, courses, roadmap
```

---

## 💻 Code Examples

### **Example 1: Supabase Client Setup**

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

**Key Points**:
- Type-safe with TypeScript
- Uses environment variables
- Persistent sessions in localStorage
- Auto-refreshes tokens

---

### **Example 2: Authentication Flow**

```typescript
// src/pages/Auth.tsx - Sign Up
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    toast.success("Account created! Please check your email.");
    navigate("/");
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

**Key Points**:
- Email verification required
- Stores additional user metadata
- Error handling with toast notifications

---

### **Example 3: Profile Creation**

```typescript
// src/pages/Onboarding.tsx - Saving Profile
const handleSubmit = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Create profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .insert({
      user_id: user.id,
      full_name: fullName,
      branch: branch,
      current_year: parseInt(currentYear),
    })
    .select()
    .single();

  // Insert skills
  await supabase
    .from("user_skills")
    .insert(
      skills.map((skill) => ({
        profile_id: profile.id,
        skill_name: skill.name,
        skill_level: skill.level,
      }))
    );

  // Insert interests
  await supabase
    .from("user_interests")
    .insert(
      interests.map((interest) => ({
        profile_id: profile.id,
        interest: interest,
      }))
    );
};
```

**Key Points**:
- Transactional data insertion
- Foreign key relationships
- Type-safe database operations

---

### **Example 4: AI Recommendation Generation**

```typescript
// supabase/functions/generate-career-recommendations/index.ts
const userPrompt = `Generate 3 career recommendations for a ${branch} 
engineering student (Year ${profile.current_year}) with the following profile:

Skills: ${skillsList || "None specified"}
Interests: ${interestsList || "None specified"}

For each career path, provide:
1. Career path name
2. Detailed description (2-3 sentences)
3. Required skills list (6-8 skills)
4. Skill gaps (skills they need to develop)
5. Recommended courses with titles and platforms
6. A 5-step roadmap from current position to career goal
7. Match score (0-100) based on their profile`;

const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  }),
});

const data = await response.json();
const recommendations = JSON.parse(data.choices[0].message.content);

// Save to database
for (const rec of recommendations) {
  await supabase
    .from("career_recommendations")
    .insert({
      profile_id: profile.id,
      career_path: rec.career_path,
      description: rec.description,
      required_skills: rec.required_skills,
      skill_gaps: rec.skill_gaps,
      recommended_courses: rec.recommended_courses,
      roadmap: rec.roadmap,
      match_score: rec.match_score,
    });
}
```

**Key Points**:
- Structured prompt engineering
- JSON response parsing
- Database persistence
- Error handling for rate limits

---

### **Example 5: UI Component (Card with Recommendations)**

```typescript
// src/pages/Results.tsx - Displaying Recommendations
{recommendations.map((rec) => (
  <Card key={rec.id} className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-2xl">{rec.career_path}</CardTitle>
      <CardDescription>{rec.description}</CardDescription>
      <div className="text-3xl font-bold text-primary">
        {rec.match_score}% Match
      </div>
    </CardHeader>
    <CardContent>
      {/* Required Skills */}
      <div className="flex flex-wrap gap-2">
        {rec.required_skills.map((skill, idx) => (
          <Badge key={idx} variant="secondary">{skill}</Badge>
        ))}
      </div>
      
      {/* Skill Gaps */}
      <div className="flex flex-wrap gap-2">
        {rec.skill_gaps.map((skill, idx) => (
          <Badge key={idx} variant="outline">{skill}</Badge>
        ))}
      </div>
      
      {/* Roadmap Steps */}
      {rec.roadmap.steps?.map((step: any, idx: number) => (
        <div key={idx} className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20">
            {idx + 1}
          </div>
          <div>
            <h5>{step.title}</h5>
            <p>{step.description}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
))}
```

**Key Points**:
- Responsive design with Tailwind
- Dynamic data rendering
- Accessible components

---

## 🔐 Security Features

### **1. Row Level Security (RLS)**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);
```

### **2. Authentication**
- JWT tokens managed by Supabase
- Secure password hashing
- Email verification
- Session management

### **3. Environment Variables**
- API keys stored in environment variables
- Not exposed to client-side code
- Separate keys for different environments

---

## 📱 Mobile App Configuration

### **Capacitor Setup**
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'AIGuide.BE.com',
  appName: 'AI_Guide',
  webDir: 'dist'
};
```

**Build Process**:
1. Build web app: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Open Android Studio: `npx cap open android`
4. Build APK/AAB

---

## 🚀 Deployment

### **Frontend**
- Can be deployed to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Any static hosting

### **Backend**
- Supabase handles:
  - Database hosting
  - Authentication service
  - Edge Functions deployment
  - API endpoints

### **Environment Variables Required**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
LOVABLE_API_KEY=your_lovable_api_key (Edge Function only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (Edge Function only)
```

---

## 📊 Key Features Summary

### **1. AI-Powered Recommendations**
- Uses Google Gemini 2.5 Flash
- Generates 3 personalized career paths
- Match score calculation (0-100%)

### **2. Skill Gap Analysis**
- Identifies missing skills
- Suggests learning resources
- Course recommendations with platforms

### **3. Career Roadmap**
- 5-step journey from student to professional
- Time estimates for each step
- Actionable guidance

### **4. Multi-Branch Support**
- Computer Engineering
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering
- Electronics Engineering

### **5. User Profile Management**
- Persistent user data
- Skill tracking
- Interest tracking
- Profile updates

---

## 🎯 Use Cases

1. **First-Year Student**: Discovers potential career paths
2. **Final-Year Student**: Identifies skill gaps before job search
3. **Career Switcher**: Explores new engineering domains
4. **Skill Developer**: Finds relevant courses and resources

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Sync Capacitor (for mobile)
npx cap sync

# Open Android Studio
npx cap open android
```

---

## 📈 Future Enhancements (Potential)

1. **Social Features**: Share recommendations, compare with peers
2. **Progress Tracking**: Track skill development over time
3. **Job Market Integration**: Real-time job postings
4. **Mentorship Matching**: Connect with industry professionals
5. **Resume Builder**: Generate resumes based on recommendations
6. **Interview Preparation**: AI-powered interview practice
7. **Multi-language Support**: Internationalization
8. **Advanced Analytics**: Career path success metrics

---

## 🎓 Learning Resources Referenced

- **React**: Component-based UI development
- **TypeScript**: Type-safe JavaScript
- **Supabase**: Backend-as-a-Service platform
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **Capacitor**: Cross-platform mobile development

---

## 📝 Conclusion

**Career Spark AI** is a comprehensive, modern web application that combines:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: Google Gemini via Lovable AI Gateway
- **Mobile**: Capacitor for Android/iOS

The application provides a seamless experience for engineering students to discover their career paths with AI-powered insights, skill gap analysis, and personalized learning recommendations.

---

**Project Status**: Production-ready
**License**: Check repository for license information
**Maintainer**: Check repository contributors

