import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, LogOut, TrendingUp, BookOpen, Target, Settings } from "lucide-react";
import resultsBackground from "@/assets/results-background.png";

interface CareerRecommendation {
  id: string;
  career_path: string;
  description: string;
  required_skills: string[];
  skill_gaps: string[];
  recommended_courses: any;
  roadmap: any;
  match_score: number;
}

const Results = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profileData) {
        navigate("/onboarding");
        return;
      }

      setProfile(profileData);

      // Check if we should force regeneration (e.g., after profile update)
      const shouldRegenerate = searchParams.get('regenerate') === 'true';

      // Load existing recommendations
      const { data: recsData } = await supabase
        .from("career_recommendations")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("match_score", { ascending: false });

      if (shouldRegenerate || !recsData || recsData.length === 0) {
        // Generate new recommendations
        await generateRecommendations(profileData);
        // Clear the regenerate parameter
        if (shouldRegenerate) {
          searchParams.delete('regenerate');
          setSearchParams(searchParams, { replace: true });
        }
      } else {
        setRecommendations(recsData);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (profileData: any) => {
    setGenerating(true);
    try {
      // Load skills and interests
      const { data: skillsData } = await supabase
        .from("user_skills")
        .select("*")
        .eq("profile_id", profileData.id);

      const { data: interestsData } = await supabase
        .from("user_interests")
        .select("*")
        .eq("profile_id", profileData.id);

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke("generate-career-recommendations", {
        body: {
          profile: profileData,
          skills: skillsData || [],
          interests: interestsData || [],
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      toast.success("Career recommendations generated successfully!");
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${resultsBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-secondary/50" />
      </div>

      <header className="border-b bg-background/90 backdrop-blur-md sticky top-0 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CareerGuide AI
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/onboarding")} className="hover:scale-105 transition-transform">
              <Settings className="h-4 w-4 mr-2" />
              Reconfigure Profile
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="hover:scale-105 transition-transform">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-0">
        {profile && (
          <div className="mb-8 animate-slide-up">
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">Welcome, {profile.full_name}!</h2>
            <p className="text-white/90 text-lg drop-shadow-md">
              {profile.branch.charAt(0).toUpperCase() + profile.branch.slice(1)} Engineering • Year {profile.current_year}
            </p>
          </div>
        )}

        {generating ? (
          <Card className="mb-8 backdrop-blur-lg bg-card/95 border-2 animate-slide-up">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Analyzing your profile...</p>
              <p className="text-sm text-muted-foreground">Our AI is generating personalized career recommendations</p>
            </CardContent>
          </Card>
        ) : recommendations.length === 0 ? (
          <Card className="backdrop-blur-lg bg-card/95 border-2">
            <CardContent className="pt-6 text-center">
              <p className="mb-4">No recommendations yet</p>
              <Button onClick={() => generateRecommendations(profile)} className="hover:scale-105 transition-transform">
                Generate Recommendations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg animate-slide-up">Your Career Paths</h3>
            {recommendations.map((rec, index) => (
              <Card key={rec.id} className="hover:shadow-2xl transition-all hover:scale-[1.02] backdrop-blur-lg bg-card/95 border-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{rec.career_path}</CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary animate-pulse-glow">{rec.match_score}%</div>
                      <div className="text-sm text-muted-foreground">Match</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Required Skills</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rec.required_skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {rec.skill_gaps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-secondary" />
                        <h4 className="font-semibold">Skills to Develop</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.skill_gaps.map((skill, idx) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-accent" />
                      <h4 className="font-semibold">Recommended Courses</h4>
                    </div>
                    <ul className="space-y-2">
                      {rec.recommended_courses.courses?.map((course: any, idx: number) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium">{course.title}</span>
                          {course.platform && <span className="text-muted-foreground"> • {course.platform}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Career Roadmap</h4>
                    <div className="space-y-3">
                      {rec.roadmap.steps?.map((step: any, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                            {idx < rec.roadmap.steps.length - 1 && (
                              <div className="w-0.5 h-full bg-primary/20 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <h5 className="font-medium">{step.title}</h5>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            {step.duration && (
                              <p className="text-xs text-muted-foreground mt-1">⏱️ {step.duration}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;
