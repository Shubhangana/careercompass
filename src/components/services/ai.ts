import { GoogleGenAI, Type } from "@google/genai";
import { searchAdzunaJobs, type AdzunaJob } from "./adzuna";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
};

export type Job = {
  title: string;
  company: string;
  location: string;
  link: string;
  type: string;
  matchPercentage: number;
  matchReason: string;
  cultureFit: number;
  cultureFitReason: string;
};

export type JobSearchParams = {
  role?: string;
  company?: string;
  workType?: string;
  minSalary?: number;
};

export type ProfileData = {
  fullName: string;
  email: string;
  skills: string[];
  experienceYears: number;
  bio: string;
};

export const extractProfileFromResume = async (resumeText: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract the following profile data from this resume:
    1. Full Name
    2. Email
    3. Skills (list of technical and soft skills)
    4. Experience Years (total years of professional experience)
    5. Bio (a short, impactful professional summary)
    
    Resume Content:
    ${resumeText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experienceYears: { type: Type.NUMBER },
          bio: { type: Type.STRING },
        },
        required: ["fullName", "email", "skills", "experienceYears", "bio"],
      },
    },
  });

  try {
    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text) as ProfileData;
  } catch (e) {
    console.error("Failed to parse profile extraction JSON:", response.text);
    throw new Error("Failed to extract profile data from resume.");
  }
};

export type CandidateMatch = {
  candidateId: string;
  candidateName: string;
  matchPercentage: number;
  matchReason: string;
  skillsMatch: string[];
  missingSkills: string[];
};

export const matchCandidatesToJob = async (jobDescription: string, candidates: any[]) => {
  const ai = getAI();
  const candidatesContext = candidates.map(c => ({
    id: c.user_id,
    name: c.full_name || c.email,
    skills: c.skills || [],
    experience: c.experience_years || 0,
    bio: c.bio || "",
    resume: c.resume_text || ""
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Match the following candidates to this job description.
    
    Job Description:
    ${jobDescription}
    
    Candidates:
    ${JSON.stringify(candidatesContext)}
    
    Instructions:
    1. For each candidate, calculate a "matchPercentage" (0-100) based on their skills, experience, and resume content relative to the job requirements.
    2. Provide a "matchReason" (max 30 words) explaining why they are a good fit or what is missing.
    3. List "skillsMatch" (skills they have that are required) and "missingSkills" (required skills they seem to lack).
    4. Return ONLY a JSON array of objects with: candidateId, candidateName, matchPercentage, matchReason, skillsMatch, missingSkills.
    5. Sort the results by matchPercentage in descending order.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            candidateId: { type: Type.STRING },
            candidateName: { type: Type.STRING },
            matchPercentage: { type: Type.NUMBER },
            matchReason: { type: Type.STRING },
            skillsMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["candidateId", "candidateName", "matchPercentage", "matchReason", "skillsMatch", "missingSkills"],
        },
      },
    },
  });

  try {
    const text = response.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text) as CandidateMatch[];
  } catch (e) {
    console.error("Failed to parse candidate matching JSON:", response.text);
    return [];
  }
};

export const analyzeResume = async (resumeText: string, file?: File, searchParams?: JobSearchParams) => {
  let textToAnalyze = resumeText;

  // If a file is provided, parse it via the backend first
  if (file) {
    console.log("Starting file parse via backend...", file.name, file.type);
    const formData = new FormData();
    formData.append("resume", file);
    
    let parseResponse;
    try {
      console.log("Sending request to /api/parse...");
      parseResponse = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });
    } catch (fetchError: any) {
      console.error("Fetch error during parse:", fetchError);
      throw new Error(`Network error while parsing file: ${fetchError.message}`);
    }

    let parseData;
    const parseText = await parseResponse.text();
    console.log("Parse response received:", parseResponse.status, parseResponse.headers.get("content-type"), parseText.substring(0, 100));
    
    try {
      parseData = JSON.parse(parseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", parseText);
      throw new Error(`Server returned non-JSON response (${parseResponse.status}). This usually means the API route was not found or the server crashed. Response start: ${parseText.substring(0, 100)}...`);
    }

    if (!parseResponse.ok) {
      throw new Error(parseData.error || `Failed to parse file: ${parseResponse.status}`);
    }
    textToAnalyze = parseData.resumeText;
    console.log("File parsed successfully, text length:", textToAnalyze.length);
  }

  if (!textToAnalyze) {
    throw new Error("No resume text provided for analysis.");
  }

  const ai = getAI();

  // 1. Analyst Agent: Deep Semantic Fingerprinting
  const analysisResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this resume with the rigor of a high-end Applicant Tracking System (ATS). 
    Provide a highly accurate and critical evaluation:
    1. ATS Score (0-100): Be critical. A generic resume should score low (40-60), while a highly optimized, keyword-rich, and result-oriented resume should score high (85+). Consider keyword density, formatting (avoiding complex layouts that break ATS), quantifiable achievements (using numbers/metrics), and professional summary strength.
    2. Key Skills: Extract specific technical and soft skills.
    3. Suggested Improvements: Identify missing critical keywords for the industry, formatting issues, or weak bullet points.
    4. Actionable Suggestions: Provide 3-5 specific, high-impact changes (e.g., "Change 'Responsible for X' to 'Achieved Y% growth by implementing X'").
    5. Market Comparison: Briefly compare this resume against top-tier candidates in the relevant field.
    6. Improved Resume: Provide a rewritten, ATS-optimized version of the resume that implements all the suggested improvements. Keep the tone professional and the formatting clean.
    
    Resume Content:
    ${textToAnalyze}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          atsScore: { type: Type.NUMBER },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          comparison: { type: Type.STRING },
          improvedResume: { type: Type.STRING },
        },
        required: ["atsScore", "skills", "improvements", "actionableSuggestions", "comparison", "improvedResume"],
      },
    },
  });

  let analysis;
  try {
    const text = analysisResponse.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    console.error("Failed to parse analysis JSON:", analysisResponse.text);
    throw new Error("Failed to parse analysis results from AI.");
  }

  // 2. Gap-Detection & Job Matching Agent
  const searchCriteria = [];
  if (searchParams?.role) searchCriteria.push(`Role: ${searchParams.role}`);
  if (searchParams?.company) searchCriteria.push(`Company: ${searchParams.company}`);
  if (searchParams?.workType) searchCriteria.push(`Type: ${searchParams.workType}`);
  if (searchParams?.minSalary) searchCriteria.push(`Min Salary: ${searchParams.minSalary}`);

  // Fetch real-time jobs from Adzuna if possible
  const adzunaJobs = await searchAdzunaJobs(searchParams?.role || analysis.skills[0] || "Software Engineer");
  const adzunaContext = adzunaJobs.length > 0 
    ? `\nHere are some real-time job openings from Adzuna to analyze and match:\n${JSON.stringify(adzunaJobs.map(j => ({
        title: j.title,
        company: j.company.display_name,
        location: j.location.display_name,
        link: j.redirect_url,
        description: j.description.substring(0, 300)
      })))}`
    : "";

  const jobsResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a high-precision recruitment agent and career strategist. Your task is to find real-time job openings that are a deep semantic match for this candidate.
    
    Candidate Resume Summary:
    ${textToAnalyze.substring(0, 2000)}... (truncated for context)
    
    Candidate Skills: ${analysis.skills.join(", ")}
    
    Search Criteria:
    ${searchCriteria.length > 0 ? searchCriteria.join(", ") : "General matching based on skills"}
    ${adzunaContext}
    
    Instructions:
    1. If Adzuna jobs were provided above, analyze and match them FIRST. 
    2. Use Google Search to find additional current job listings AND the company's 'About Us' pages, mission statements, or core values for ALL jobs (including Adzuna ones).
    3. For each job found, perform a multi-dimensional analysis:
       - Tech Stack Alignment: Compare the specific technology stacks mentioned in the job description with the candidate's expertise.
       - Company Culture & Values: Explicitly search for and analyze the company's mission statement, values, or 'About Us' page. Assess fit based on the candidate's background and inferred work style.
       - Growth Potential: Evaluate the role's potential for career advancement and skill development.
       - Core Requirements: Standard check of years of experience, education, and primary responsibilities.
    4. Calculate a "matchPercentage" (0-100) that reflects a weighted average of these factors. Be rigorous; a 90%+ match should be rare and exceptional.
    5. Provide a "matchReason" (max 25 words) that highlights the most critical alignment or gap.
    6. Provide a "cultureFit" score (0-100) and a "cultureFitReason" (max 25 words) based on your analysis of the company's mission and values.
    7. Return ONLY a JSON array of objects with: title, company, location, link, type (Full-time/Remote/Contract), matchPercentage, matchReason, cultureFit, cultureFitReason.
    
    Do not include any other text or markdown formatting.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  let jobs = [];
  try {
    const text = jobsResponse.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    jobs = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    console.error("Failed to parse jobs JSON:", jobsResponse.text);
  }

  // 3. Synthesizer & RAG Agent (Course Recommendations)
  const coursesResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find real-time course recommendations to improve these skills: ${analysis.skills.join(", ")}. 
    Return ONLY a JSON array of objects with: title, provider, link, price (Free/Paid), duration.
    Do not include any other text or markdown formatting.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  let courses = [];
  try {
    const text = coursesResponse.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    courses = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    console.error("Failed to parse courses JSON:", coursesResponse.text);
  }

  return {
    resumeText: textToAnalyze,
    analysis,
    jobs,
    courses,
  };
};

export const generateCoverLetter = async (resumeText: string, companyName: string, template: string, jobDescription?: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional cover letter for ${companyName} based on this resume: ${resumeText}. 
    Template Style: ${template}.
    ${jobDescription ? `Job Description: ${jobDescription}` : ""}
    Make it highly personalized and impactful.`,
  });
  return response.text;
};
