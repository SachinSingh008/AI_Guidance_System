import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, skills, interests } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare context for AI
    const skillsList = skills.map((s: any) => `${s.skill_name} (${s.skill_level})`).join(", ");
    const interestsList = interests.map((i: any) => i.interest).join(", ");
    const branch = profile.branch;

    const systemPrompt = `You are an expert career counselor specializing in engineering careers. Your role is to provide detailed, personalized career recommendations for engineering students.`;

    const userPrompt = `Generate 3 career recommendations for a ${branch} engineering student (Year ${profile.current_year}) with the following profile:

Skills: ${skillsList || "None specified"}
Interests: ${interestsList || "None specified"}

For each career path, provide:
1. Career path name
2. Detailed description (2-3 sentences)
3. Required skills list (6-8 skills)
4. Skill gaps (skills they need to develop)
5. Recommended courses with titles and platforms
6. A 5-step roadmap from current position to career goal
7. Match score (0-100) based on their profile

Format your response as a JSON array with the following structure:
[
  {
    "career_path": "Career Name",
    "description": "Description text",
    "required_skills": ["skill1", "skill2"],
    "skill_gaps": ["gap1", "gap2"],
    "recommended_courses": {
      "courses": [
        {"title": "Course Name", "platform": "Platform Name"}
      ]
    },
    "roadmap": {
      "steps": [
        {"title": "Step Title", "description": "Step description", "duration": "Time estimate"}
      ]
    },
    "match_score": 85
  }
]`;

    console.log("Calling Lovable AI for career recommendations...");

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log("AI Response received, parsing...");

    // Parse the JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save recommendations to database
    const savedRecs = [];
    for (const rec of recommendations) {
      const { data: savedRec, error } = await supabase
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
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving recommendation:", error);
      } else {
        savedRecs.push(savedRec);
      }
    }

    console.log(`Successfully saved ${savedRecs.length} recommendations`);

    return new Response(
      JSON.stringify({ recommendations: savedRecs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-career-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
