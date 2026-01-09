import {GoogleGenAI} from "@google/genai"
import ErrorHandler from "../utils/errorhandler.util.js";

export const ai = new GoogleGenAI({
    apiKey:process.env.GOOGLE_API_KEY as string,  
});

export const careerguidance2 =async (skill:string) => {
  const prompt:string = `
  Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or
markdown formatting outside of the JSON structure.

The JSON object should have the following structure:
{
  "summary": "A brief, encouraging summary of the user's skill set and their general job title.",
  "jobOptions": [
    {
      "title": "The name of the job role.",
      "responsibilities": "A description of what the user would do in this role.",
      "why": "An explanation of why this role is a good fit for their skills."
    }
  ],
  "skillsToLearn": [
    {
      "category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack Mastery', 'DevOps & Cloud').",
      "skills": [
        {
          "title": "The name of the skill to learn.",
          "why": "Why learning this skill is important.",
          "how": "Specific examples of how to learn or apply this skill."
        }
      ]
    }
  ],
  "learningApproach": {
    "title": "How to Approach Learning",
    "points": ["A bullet point list of actionable advice for learning."]
  }
}

  `
  const response = await ai.models.generateContent({
    model:"gemini-2.5-flash",
    contents:prompt
  })
try {
  const rawtext=response.text?.replace(/```json/g,'').replace(/```/g,'').trim()
  if(!rawtext) throw new ErrorHandler(400,"No response from AI");
  return JSON.parse(rawtext)
} catch (error) {
  throw new ErrorHandler(500,"Failed to parse AI response")
}
}


export const resumeanalyser2 = async(pdfbase64:string) => {
  try {
    const prompt:string = `
    You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume and provide:

An ATS compatibility score (0–100)

Detailed suggestions to improve the resume for better ATS performance

Your entire response must be in valid JSON format.
Do not include any text or markdown formatting outside of the JSON structure.

The JSON object should have the following structure:

{
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": {
      "score": 90,
      "feedback": "Brief feedback on formatting"
    },
    "keywords": {
      "score": 80,
      "feedback": "Brief feedback on keyword usage"
    },
    "structure": {
      "score": 85,
      "feedback": "Brief feedback on resume structure"
    },
    "readability": {
      "score": 88,
      "feedback": "Brief feedback on readability"
    }
  },
  "suggestions": [
    {
      "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords', 'Structure')",
      "issue": "Description of the issue found",
      "recommendation": "Specific actionable recommendation to fix it",
      "priority": "high/medium/low"
    }
  ],
  "strengths": [
    "List of things the resume does well for ATS"
  ],
  "summary": "A brief 2–3 sentence summary of the overall ATS performance"
}


Focus on:

File format and structure compatibility

Proper use of standard section headings

Keyword optimization

Formatting issues (tables, columns, graphics, special characters)

Contact information placement

Date formatting

Use of action verbs and quantifiable achievements

Section organization and flow
    
    `;
const response = await ai.models.generateContent({
    model:"gemini-2.5-flash",
    contents:[{
      role:"user",
      parts:[{
        text:prompt
      },{
        inlineData:{
          mimeType:"application/pdf",
          data:pdfbase64.replace(/^data:application\/pdf;base64,/,'')
        }
      }
    ]
    }]
  })
try {
  const rawtext=response.text?.replace(/```json/g,'').replace(/```/g,'').trim()
  if(!rawtext) throw new ErrorHandler(400,"No response from AI");
  return JSON.parse(rawtext)
} catch (error) {
  throw new ErrorHandler(500,"Failed to parse AI response")
}

  } catch (error) {
    throw new ErrorHandler(500,"Resume analysis failed");
    
  }
}
