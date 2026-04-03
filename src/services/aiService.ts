import { GoogleGenAI, Type } from "@google/genai";
import { Proposal, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateProposalAI(
  rawDescription: string,
  projectType: string,
  clientType: string,
  complexity: string,
  userProfile: UserProfile,
  clientName?: string
): Promise<Proposal> {
  const model = "gemini-3-flash-preview";

  console.log("Starting AI Proposal Generation for:", clientName);
  
  const systemInstruction = `You are ProposalCraft AI, an expert Indian freelance business consultant.
  You help Indian freelancers win clients by generating professional proposals with accurate INR pricing, GST (18%) implications, and Indian contract law basics.
  
  Always return ONLY valid JSON. The JSON must be parseable by JSON.parse() directly.
  Use Indian market rates. Currency is always INR.
  If the user has a GST number, include 18% GST in pricing.
  Address the client directly in the executive summary.`;

  const prompt = `
  FREELANCER PROFILE:
  Name: ${userProfile.name}
  Profession: ${userProfile.profession}
  Hourly Rate: ₹${userProfile.hourlyRate}/hour
  City: ${userProfile.city || 'India'}
  Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
  GST Registered: ${userProfile.gstNumber ? 'Yes' : 'No'}
  
  PROJECT DETAILS:
  Description: "${rawDescription}"
  Project Type: ${projectType}
  Client Type: ${clientType}
  Complexity: ${complexity}
  Client Name: ${clientName || 'Client'}
  
  Generate a complete, professional freelance proposal as JSON matching the following structure:
  {
    "title": "string",
    "executiveSummary": "string",
    "scopeOfWork": [{ "phase": "string", "phaseNumber": number, "deliverables": ["string"], "duration": "string", "description": "string" }],
    "exclusions": ["string"],
    "assumptions": ["string"],
    "timeline": [{ "milestone": "string", "description": "string", "day": "string", "paymentPercentage": number, "amountInr": number }],
    "pricingBreakdown": {
      "model": "fixed",
      "currency": "INR",
      "items": [{ "task": "string", "description": "string", "hours": number, "ratePerHour": number, "amount": number }],
      "subtotal": number,
      "buffer": number,
      "bufferPercentage": number,
      "gstApplicable": boolean,
      "gstAmount": number,
      "gstPercentage": 18,
      "total": number,
      "totalInWords": "string"
    },
    "contractClauses": [{ "id": "string", "title": "string", "category": "string", "content": "string", "isRecommended": boolean }],
    "paymentTerms": { "advance": number, "milestone": number, "delivery": number, "advanceAmount": number, "milestoneAmount": number, "deliveryAmount": number, "latePenalty": "string", "paymentMethods": ["string"] },
    "revisionPolicy": "string",
    "validityPeriod": "string",
    "projectRisks": ["string"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      console.error("AI returned empty response");
      throw new Error("No response from AI");
    }
    
    console.log("AI Response received, parsing JSON...");
    const data = JSON.parse(text);
    
    return {
      ...data,
      userId: userProfile.uid,
      rawDescription,
      projectType,
      clientType,
      complexity,
      clientName,
      status: 'draft',
      totalValueInr: data.pricingBreakdown.total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Proposal;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

export async function regenerateSectionAI(
  section: string,
  currentProposal: Proposal,
  userFeedback: string,
  userProfile: UserProfile
): Promise<any> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
  You are an expert proposal writer. The user wants to regenerate the "${section}" section of their proposal.
  
  CURRENT PROPOSAL TITLE: ${currentProposal.title}
  CURRENT SECTION CONTENT: ${JSON.stringify(currentProposal[section as keyof Proposal])}
  USER FEEDBACK/REQUIREMENT: "${userFeedback}"
  
  FREELANCER PROFILE: ${userProfile.name}, ${userProfile.profession}, ₹${userProfile.hourlyRate}/hr
  
  Regenerate ONLY the "${section}" section data as a JSON object or array (depending on the section type).
  Do not include any other fields. Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Regeneration Error:", error);
    throw error;
  }
}
