import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import onboardingBackground from "@/assets/onboarding-background.png";

const BRANCHES = [
  { value: "computer", label: "Computer Engineering", icon: "💻" },
  { value: "mechanical", label: "Mechanical Engineering", icon: "⚙️" },
  { value: "civil", label: "Civil Engineering", icon: "🏗️" },
  { value: "electrical", label: "Electrical Engineering", icon: "⚡" },
  { value: "electronics", label: "Electronics Engineering", icon: "📡" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form data
  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [skills, setSkills] = useState<Array<{ name: string; level: string }>>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Input states
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [interestInput, setInterestInput] = useState("");

  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      // Load existing profile data for editing
      setExistingProfileId(profile.id);
      setFullName(profile.full_name);
      setBranch(profile.branch);
      setCurrentYear(profile.current_year.toString());

      // Load existing skills
      const { data: skillsData } = await supabase
        .from("user_skills")
        .select("*")
        .eq("profile_id", profile.id);

      if (skillsData) {
        setSkills(skillsData.map(s => ({ name: s.skill_name, level: s.skill_level })));
      }

      // Load existing interests
      const { data: interestsData } = await supabase
        .from("user_interests")
        .select("*")
        .eq("profile_id", profile.id);

      if (interestsData) {
        setInterests(interestsData.map(i => i.interest));
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, { name: skillInput.trim(), level: skillLevel }]);
      setSkillInput("");
      setSkillLevel("beginner");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async () => {
    if (!fullName || !branch || !currentYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let profileId = existingProfileId;

      if (existingProfileId) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            full_name: fullName,
            branch: branch as any,
            current_year: parseInt(currentYear),
          })
          .eq("id", existingProfileId);

        if (profileError) throw profileError;

        // Delete existing skills and interests
        await supabase.from("user_skills").delete().eq("profile_id", existingProfileId);
        await supabase.from("user_interests").delete().eq("profile_id", existingProfileId);

        // Delete existing recommendations to regenerate
        await supabase.from("career_recommendations").delete().eq("profile_id", existingProfileId);
      } else {
        // Create new profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            full_name: fullName,
            branch: branch as any,
            current_year: parseInt(currentYear),
          })
          .select()
          .single();

        if (profileError) throw profileError;
        profileId = profile.id;
      }

      // Insert skills
      if (skills.length > 0 && profileId) {
        const { error: skillsError } = await supabase
          .from("user_skills")
          .insert(
            skills.map((skill) => ({
              profile_id: profileId,
              skill_name: skill.name,
              skill_level: skill.level as any,
            }))
          );

        if (skillsError) throw skillsError;
      }

      // Insert interests
      if (interests.length > 0 && profileId) {
        const { error: interestsError } = await supabase
          .from("user_interests")
          .insert(
            interests.map((interest) => ({
              profile_id: profileId,
              interest: interest,
            }))
          );

        if (interestsError) throw interestsError;
      }

      toast.success(existingProfileId ? "Profile updated successfully!" : "Profile created successfully!");
      navigate(existingProfileId ? "/results?regenerate=true" : "/results");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${onboardingBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-8 text-center animate-slide-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {existingProfileId ? "Update Your Profile" : "Let's Get Started"}
          </h1>
          <p className="text-white/90 text-lg drop-shadow-lg">
            {existingProfileId ? "Make changes to your profile and regenerate recommendations" : "Tell us about yourself to get personalized career recommendations"}
          </p>
        </div>

        <Card className="shadow-2xl backdrop-blur-lg bg-card/95 border-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>Step {step} of 3</CardTitle>
            <CardDescription>
              {step === 1 && "Basic Information"}
              {step === 2 && "Your Skills"}
              {step === 3 && "Your Interests"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Engineering Branch *</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.icon} {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Year *</Label>
                  <Select value={currentYear} onValueChange={setCurrentYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g., Python, AutoCAD, Circuit Design"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                  </div>
                  <Select value={skillLevel} onValueChange={setSkillLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addSkill} variant="secondary" className="hover:scale-105 transition-transform">Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                      {skill.name} ({skill.level})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeSkill(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add your technical and soft skills
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    placeholder="e.g., AI, Robotics, Construction, IoT"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <Button onClick={addInterest} variant="secondary" className="hover:scale-105 transition-transform">Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="pl-3 pr-1 py-1">
                      {interest}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeInterest(interest)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {interests.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    What areas of engineering interest you?
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 hover:scale-105 transition-transform">
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="flex-1 hover:scale-105 transition-transform">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="flex-1 hover:scale-105 transition-transform">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (existingProfileId ? "Update Profile" : "Get My Recommendations")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
