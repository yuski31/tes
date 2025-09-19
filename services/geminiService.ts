import { GoogleGenAI, Type } from "@google/genai";
import type { Blueprint, ComparisonData, ComparisonItem, ChatMessage } from '../types';

// The API_KEY from environment is for Google GenAI (logo generation).
// If it's missing, only logo generation will fail.
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Logo generation and technology comparison will fail.");
}

// AI Client for image generation (remains Google GenAI)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const predefinedModels = [
    'openrouter/sonoma-sky-alpha',
    'google/gemini-flash-1.5',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3-8b-instruct',
    'mistralai/mistral-7b-instruct',
    'microsoft/phi-3-mini-128k-instruct',
];

export const fetchOpenRouterModels = async (apiKey: string): Promise<string[]> => {
    if (!apiKey.trim()) {
        return predefinedModels;
    }
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });
        if (!response.ok) {
            console.error("Failed to fetch models from OpenRouter, using predefined list.");
            return predefinedModels;
        }
        const data = await response.json();
        const modelIds = data.data.map((model: { id: string }) => model.id);
        // Ensure the default model is in the list and at the top
        const defaultModel = 'openrouter/sonoma-sky-alpha';
        const finalModels = new Set([defaultModel, ...modelIds]);
        return Array.from(finalModels);
    } catch (error) {
        console.error("Error fetching models:", error);
        return predefinedModels;
    }
};

export const enhancePrompt = async (userInput: string, apiConfig: ApiConfig): Promise<string> => {
    const prompt = `
    You are an expert prompt engineer. Your task is to enhance the following user idea for an AI company blueprint to be more detailed, specific, and actionable.
    The goal is to create a prompt that will guide an AI to generate a comprehensive and high-quality business and technical plan.
    Flesh out the user's core concepts with more specifics. For example, if they mention 'AI chat', expand on the potential features like multi-model comparison, session history, and code execution. If they mention 'API services', suggest different API types and potential developer-focused features.
    The enhanced prompt must be a direct instruction to the blueprint-generating AI.
    Respond ONLY with the enhanced prompt text. Do not include any preamble, explanations, or markdown formatting.

    User Idea: "${userInput}"
    `;

    try {
        const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiConfig.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://aistudio.google.com/app",
                "X-Title": "AI Company Blueprint Generator"
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: [{ role: "user", content: prompt }],
                stream: false,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            if (response.status === 401) throw new Error('Invalid API Key');
            if (response.status === 429) throw new Error('Quota Exceeded');
            throw new Error(`AI Service Error: API returned status ${response.status}. ${errorData.error?.message || ''}`);
        }

        const responseData = await response.json();
        return responseData.choices[0].message.content.trim();

    } catch (error: any) {
        console.error("Prompt enhancement failed:", error);
        if (error.message?.includes('Invalid API Key')) throw error;
        if (error.message?.includes('Quota Exceeded')) throw error;
        throw new Error('AI Service Error');
    }
};


const responseSchema = {
    type: 'object',
    properties: {
        companyName: { type: 'string', description: "The name of the company." },
        missionStatement: { type: 'string', description: "A concise mission statement for the company." },
        visionStatement: { type: 'string', description: "A forward-looking vision statement for the company." },
        coreServices: {
            type: 'array',
            description: "A list of the core services offered by the company.",
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: "The name of the service." },
                    description: { type: 'string', description: "A detailed description of the service." },
                    features: { type: 'array', items: { type: 'string' }, description: "Key features of the service." }
                },
                required: ["name", "description", "features"]
            }
        },
        targetAudience: {
            type: 'array',
            description: "A list of target audience segments.",
            items: { type: 'string' }
        },
        uiUxPrinciples: {
            type: 'array',
            description: "Key UI/UX design principles to be followed.",
            items: { type: 'string' }
        },
        techStack: {
            type: 'array',
            description: "The proposed technology stack, categorized.",
            items: {
                type: 'object',
                properties: {
                    category: { type: 'string', description: "e.g., Frontend, Backend, Database, AI/ML." },
                    technologies: { type: 'array', items: { type: 'string' }, description: "List of technologies in this category." }
                },
                required: ["category", "technologies"]
            }
        },
        monetization: {
            type: 'array',
            description: "Potential monetization strategies.",
            items: {
                type: 'object',
                properties: {
                    strategy: { type: 'string', description: "The name of the strategy, e.g., 'Subscription Tiers'." },
                    description: { type: 'string', description: "Description of how the strategy works." },
                    pricingDetails: { type: 'array', items: { type: 'string' }, description: "Specific pricing strategies and potential tiers." },
                    keyMetrics: { type: 'array', items: { type: 'string' }, description: "Key financial metrics to track for this strategy (e.g., MRR, LTV, CAC)." }
                },
                required: ["strategy", "description", "pricingDetails", "keyMetrics"]
            }
        },
        architecturalBlueprint: {
            type: 'array',
            description: "A high-level architectural blueprint of the system.",
            items: {
                type: 'object',
                properties: {
                    component: { type: 'string', description: "The name of the architectural component, e.g., 'API Gateway'." },
                    description: { type: 'string', description: "The role and responsibility of the component." },
                    technologies: { type: 'array', items: { type: 'string' }, description: "Specific technologies for this component." }
                },
                required: ["component", "description", "technologies"]
            }
        },
        roadmap: {
            type: 'array',
            description: "A phased product roadmap.",
            items: {
                type: 'object',
                properties: {
                    phase: { type: 'string', description: "e.g., 'Phase 1 (MVP)'" },
                    title: { type: 'string', description: "A title for the phase." },
                    focus: { type: 'array', items: { type: 'string' }, description: "Key focus areas for this phase." },
                    kpis: { type: 'array', items: { type: 'string' }, description: "Key Performance Indicators to measure success for this phase." },
                    milestones: { type: 'array', items: { type: 'string' }, description: "Concrete milestones for this phase, covering the next 18-24 months." },
                },
                required: ["phase", "title", "focus", "kpis", "milestones"]
            }
        },
        teamStructure: {
            type: 'array',
            description: "Proposed team structure with key roles and responsibilities.",
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: "The job title, e.g., 'AI Engineer'." },
                    responsibilities: { type: 'array', items: { type: 'string' }, description: "Brief description of the role's key responsibilities." }
                },
                required: ["title", "responsibilities"]
            }
        },
        competitiveAnalysis: {
            type: 'object',
            description: "An analysis of the competitive landscape.",
            properties: {
                competitors: {
                    type: 'array',
                    description: "A list of potential competitors.",
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: "Name of the competitor." },
                            strengths: { type: 'array', items: { type: 'string' }, description: "Key strengths of the competitor." },
                            weaknesses: { type: 'array', items: { type: 'string' }, description: "Key weaknesses of the competitor." }
                        },
                        required: ["name", "strengths", "weaknesses"]
                    }
                },
                keyDifferentiators: {
                    type: 'array',
                    description: "The company's key differentiators.",
                    items: { type: 'string' }
                }
            },
            required: ["competitors", "keyDifferentiators"]
        },
    },
    required: ["companyName", "missionStatement", "visionStatement", "coreServices", "targetAudience", "uiUxPrinciples", "techStack", "monetization", "architecturalBlueprint", "roadmap", "teamStructure", "competitiveAnalysis"]
};


export const generateCompanyBlueprint = async (userInput: string, apiConfig: ApiConfig): Promise<Blueprint> => {
    const stringifiedSchema = JSON.stringify(responseSchema, null, 2);

    const prompt = `
    Act as an expert business strategist, software architect, and HR consultant with 15 years of experience in the tech industry.
    Your task is to generate a comprehensive and detailed business and technical blueprint for an AI company based on the following user-provided idea.
    The output must be a single, valid JSON object that strictly adheres to the JSON schema provided below. Do not include any extra text, explanations, or markdown formatting like \`\`\`json before or after the JSON object.

    JSON Schema:
    ${stringifiedSchema}

    User Idea: "${userInput}"

    Based on the user idea and the schema, generate the blueprint with detailed, actionable, and professional content for each section. Ensure all fields from the schema are present in your response.
    
    Key areas to elaborate on:
    1.  **Core Services:** Be highly specific. For each service, detail unique features and articulate a clear value proposition.
    2.  **Tech Stack:** Suggest specific, relevant AI/ML frameworks (e.g., TensorFlow, PyTorch, LangChain), cloud platforms (e.g., GCP Vertex AI, AWS SageMaker), and MLOps tools (e.g., MLflow, Kubeflow).
    3.  **Competitive Analysis:** Identify 2-3 key potential competitors. List their primary strengths and weaknesses, then define the company's key differentiators.
    4.  **UI/UX Principles:** Generate principles that specifically address user onboarding, intuitive navigation for complex features (like an AI playground), and clear data visualization.
    5.  **Monetization Model:** For each strategy, provide specific details on pricing strategies (e.g., 'Freemium with a $49/month Pro tier'), list potential revenue streams, and identify key financial metrics to track (e.g., MRR, LTV, CAC).
    6.  **Product Roadmap:** For each phase, define specific Key Performance Indicators (KPIs) (e.g., 'Achieve 1,000 active users') and suggest concrete, actionable milestones for the next 18-24 months.
    7.  **Team Structure and Roles:** Define 4-6 key roles essential for the company (e.g., AI Engineer, Product Manager, UX/UI Designer, Sales Lead). For each role, provide a brief list of their primary responsibilities.
    `;

    let response;
    try {
        response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiConfig.apiKey}`,
                "Content-Type": "application/json",
                // Recommended by OpenRouter to identify the app
                "HTTP-Referer": "https://aistudio.google.com/app",
                "X-Title": "AI Company Blueprint Generator"
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
             if (response.status === 401) throw new Error('Invalid API Key');
             if (response.status === 429) throw new Error('Quota Exceeded');
             throw new Error(`AI Service Error: API returned status ${response.status}. ${errorData.error?.message || ''}`);
        }

    } catch (error: any) {
        console.error("API call failed:", error);
        if (error.message?.includes('Invalid API Key')) throw error;
        if (error.message?.includes('Quota Exceeded')) throw error;
        if (error.message?.includes('AI Service Error')) throw error;
        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network request failed'))) {
             throw new Error('Network Error');
        }
        throw new Error('AI Service Error');
    }

    try {
        const responseData = await response.json();
        const jsonText = responseData.choices[0].message.content.trim();
        if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
             throw new Error("The AI returned an invalid response format.");
        }
        const blueprintData: Blueprint = JSON.parse(jsonText);
        return blueprintData;
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("The AI returned an invalid response format.");
    }
};

export async function* streamChatCompletion(history: ChatMessage[], apiConfig: ApiConfig): AsyncGenerator<string, void, unknown> {
    const messages = history.map(({ role, content }) => ({ role, content }));
    let response;
    try {
         response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiConfig.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://aistudio.google.com/app",
                "X-Title": "AI Company Blueprint Generator"
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: messages,
                stream: true,
            })
        });
    } catch (error: any) {
        console.error("Chat API call failed:", error);
        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network request failed'))) {
             throw new Error('Network Error');
        }
        throw new Error('AI Service Error');
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        if (response.status === 401) throw new Error('Invalid API Key');
        if (response.status === 429) throw new Error('Quota Exceeded');
        throw new Error(`AI Service Error: API returned status ${response.status}. ${errorData.error?.message || ''}`);
    }

    if (!response.body) {
        throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const dataStr = line.substring(6);
                    if (dataStr === "[DONE]") {
                        return;
                    }
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                            yield data.choices[0].delta.content;
                        }
                    } catch (e) {
                        console.error("Failed to parse stream chunk:", e, "Chunk:", dataStr);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

export const getTechnologyComparison = async (technologies: string[]): Promise<ComparisonData> => {
    if (!process.env.API_KEY) {
        throw new Error("Google API Key Not Configured: This feature requires a Google GenAI API key to be set in the app's environment variables.");
    }

    const comparisonSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                technologyName: { type: Type.STRING, description: 'The name of the technology/model being compared.' },
                pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3-4 key advantages or strengths.' },
                cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3-4 key disadvantages or weaknesses.' },
                bestUseCases: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 ideal applications or scenarios for this technology.' },
            },
            required: ["technologyName", "pros", "cons", "bestUseCases"],
        },
    };

    const prompt = `
    Provide a concise, side-by-side technical comparison of the following technologies: ${technologies.join(', ')}.
    For each technology, identify its key pros, cons, and best use cases.
    The output must be a single, valid JSON object that strictly adheres to the provided JSON schema. Do not include any extra text, explanations, or markdown formatting.
    Ensure the "technologyName" in the response exactly matches the names provided in this prompt.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });

        const jsonText = response.text.trim();
        const comparisonResult: ComparisonData = JSON.parse(jsonText);
        
        const sortedResult = technologies.map(techName => 
            comparisonResult.find(item => item.technologyName.toLowerCase() === techName.toLowerCase())
        ).filter((item): item is ComparisonItem => item !== undefined);

        return sortedResult;

    } catch (error: any) {
        console.error("Technology comparison failed:", error);
        if (error.message?.includes('400') || error.message?.includes('API key not valid')) {
             throw new Error("Invalid Google API Key: The configured API key is invalid or lacks permissions for the Generative Language API.");
        }
        throw new Error("Failed to generate technology comparison. The AI service may be temporarily unavailable.");
    }
};

export const generateLogo = async (companyName: string): Promise<string> => {
    const prompt = `A professional, modern, minimalist logo for an AI and technology services company named '${companyName}'. The logo should be clean, iconic, and suitable for a tech brand. Use abstract shapes or stylized letters, focusing on themes of intelligence, connectivity, and innovation. High resolution, vector style, on a plain background.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("Failed to generate company logo.");
    }
};
