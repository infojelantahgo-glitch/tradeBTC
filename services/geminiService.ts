import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisConfig, AnalysisResult, AnalysisReport } from '../types';

if (!process.env.API_KEY) {
  console.error("API Key for Gemini is not configured in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisReportSchema = {
    type: Type.OBJECT,
    properties: {
        analysis_summary: {
            type: Type.STRING,
            description: "A concise summary of the analysis performed."
        },
        rating: {
            type: Type.STRING,
            description: "The concluding rating based on the analysis."
        }
    },
    required: ["analysis_summary", "rating"]
};

/**
 * Takes unstructured text and uses a schema-enforced Gemini call to extract a structured analysis report.
 * This ensures a reliable JSON output even if the initial text is conversational.
 * @param text The unstructured text from a previous analysis.
 * @param model The AI model to use for structuring.
 * @returns A promise that resolves to a structured AnalysisReport.
 */
const getStructuredReportFromText = async (text: string, model: string): Promise<AnalysisReport> => {
    const structuringPrompt = `
        From the following text, extract the analysis summary and a final rating.
        The rating must be one of [STRONG BUY, BUY, HOLD, SELL, STRONG SELL] for fundamental/technical analysis,
        or one of [VERY POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY NEGATIVE] for sentiment analysis.
        
        Return the result as a JSON object with keys "analysis_summary" and "rating".

        Text to analyze:
        ---
        ${text}
        ---
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: structuringPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisReportSchema,
        },
    });

    return JSON.parse(response.text.trim()) as AnalysisReport;
};


const getAnalysis = async (prompt: string, config: AnalysisConfig, useSearch: boolean): Promise<AnalysisReport> => {
    try {
        if (useSearch) {
            // Robust two-step process for search-enabled analysis:
            // 1. Gather information with Google Search. The response might be unstructured.
            const searchResponse = await ai.models.generateContent({
                model: config.aiModel,
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }]
                },
            });
            const rawText = searchResponse.text.trim();

            // 2. Structure the raw text response using a separate, schema-enforced call.
            return await getStructuredReportFromText(rawText, config.aiModel);
        } else {
            // Standard path for non-search analysis: Directly request JSON with a schema.
            const response = await ai.models.generateContent({
                model: config.aiModel,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: analysisReportSchema,
                },
            });
            
            return JSON.parse(response.text.trim()) as AnalysisReport;
        }
    } catch (error) {
        console.error("Error fetching analysis from Gemini:", error);
         if (error instanceof SyntaxError) {
             console.error("Failed to parse JSON response from Gemini. This may indicate an unexpected response format from the API.");
        }
        throw new Error("Failed to get analysis from Gemini API.");
    }
};

const createFundamentalPrompt = (symbol: string, date: string, config: AnalysisConfig): string => `
  You are a senior fundamental analyst for a top-tier investment bank.
  Your task is to provide a fundamental analysis for the stock symbol: ${symbol}, with data as of ${date}.
  Use ${config.dataVendors.fundamentalData} as your primary data source.
  Analyze key metrics like P/E ratio, revenue growth, net income, and debt-to-equity.
  Conclude with a precise rating from this list: [STRONG BUY, BUY, HOLD, SELL, STRONG SELL].
  Provide a summary of your findings and the final rating.
`;

const createTechnicalPrompt = (symbol: string, date: string, config: AnalysisConfig): string => `
  You are a chartered market technician with 20 years of experience.
  Your task is to provide a technical analysis for the stock symbol: ${symbol}, focusing on the trends leading up to ${date}.
  Use ${config.dataVendors.technicalIndicators} as your primary data source.
  Analyze chart patterns, moving averages (50-day and 200-day), RSI, and MACD.
  Conclude with a precise rating from this list: [STRONG BUY, BUY, HOLD, SELL, STRONG SELL].
  Provide a summary of your findings and the final rating.
`;

const createSentimentPrompt = (symbol: string, date: string, config: AnalysisConfig): string => `
  You are a quantitative sentiment analyst.
  Your task is to analyze the news sentiment for the stock symbol: ${symbol}, around the date ${date}.
  Use ${config.dataVendors.newsData} as your primary news source.
  Aggregate and analyze the tone of major financial news articles, press releases, and social media trends.
  Conclude with a precise rating from this list: [VERY POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY NEGATIVE].
  Provide a summary of your findings and the final rating.
`;

export const runAnalysis = async (symbol: string, date: string, config: AnalysisConfig, currentPrice: number): Promise<AnalysisResult> => {
    
    const [fundamental, technical, sentiment] = await Promise.all([
        getAnalysis(createFundamentalPrompt(symbol, date, config), config, config.dataVendors.fundamentalData === 'google' || config.dataVendors.fundamentalData === 'gemini'),
        getAnalysis(createTechnicalPrompt(symbol, date, config), config, config.dataVendors.technicalIndicators === 'google'),
        getAnalysis(createSentimentPrompt(symbol, date, config), config, config.dataVendors.newsData === 'google' || config.dataVendors.newsData === 'gemini')
    ]);

    const synthesisPrompt = `
      You are the Chief Investment Officer of a multi-billion dollar hedge fund.
      You have received three analyst reports for stock symbol ${symbol} for date ${date}.
      The current market price is approximately $${currentPrice.toFixed(2)}. Use this as a key reference for your trading plan.
      Your job is to synthesize these reports, make a final, decisive trading decision, and create a concrete trading plan.
      The internal debate should be conducted for ${config.debateRounds} round(s).

      1.  **Fundamental Analysis Report:**
          - Rating: ${fundamental.rating}
          - Summary: ${fundamental.analysis_summary}

      2.  **Technical Analysis Report:**
          - Rating: ${technical.rating}
          - Summary: ${technical.analysis_summary}

      3.  **News Sentiment Report:**
          - Rating: ${sentiment.rating}
          - Summary: ${sentiment.analysis_summary}

      Weigh the evidence from all three reports, highlighting convergences and divergences.
      Provide a final trading recommendation from this list: [STRONG BUY, BUY, HOLD, SELL, STRONG SELL].
      Include a detailed justification explaining your reasoning for the final decision.

      **Crucially, you must also generate a detailed Trading Plan based on your analysis and the current price of $${currentPrice.toFixed(2)}.**
      The trading plan must be structured as follows:
      - signal: The trading signal (e.g., 'BUY', 'HOLD', 'SELL').
      - entry_price: Suggested entry price. Use the current price as a baseline or suggest a specific limit order price.
      - take_profit_1: First take profit level with percentage gain (e.g., "4,179.00 (+5.00%)").
      - take_profit_2: Second take profit level with percentage gain (e.g., "4,376.00 (+10.00%)").
      - stop_loss: Stop loss level with percentage loss (e.g., "3,860.60 (-3.00%)").
      - score: Confidence score out of 100 (e.g., "65/100").
      - win_rate: Estimated win rate (e.g., "55%").
      - risk_reward_ratio: The risk to reward ratio (e.g., "1:1.67").
      - reasons: A bulleted list of reasons for the trade, each starting with a '•' character.
      - risks: A bulleted list of potential risks, each starting with a '•' character.
      - action: A short, actionable instruction (e.g., "WAIT for confirmation").

      Return the final output as a JSON object. The trading plan must be a nested object with the key "trading_plan".
    `;
    
    const tradingPlanSchema = {
      type: Type.OBJECT,
      properties: {
          signal: { type: Type.STRING },
          entry_price: { type: Type.STRING },
          take_profit_1: { type: Type.STRING },
          take_profit_2: { type: Type.STRING },
          stop_loss: { type: Type.STRING },
          score: { type: Type.STRING },
          win_rate: { type: Type.STRING },
          risk_reward_ratio: { type: Type.STRING },
          reasons: { type: Type.STRING },
          risks: { type: Type.STRING },
          action: { type: Type.STRING },
      },
      required: ["signal", "entry_price", "take_profit_1", "take_profit_2", "stop_loss", "score", "win_rate", "risk_reward_ratio", "reasons", "risks", "action"]
    };

    const synthesisSchema = {
        type: Type.OBJECT,
        properties: {
            final_decision: { type: Type.STRING },
            justification: { type: Type.STRING },
            source_reports: {
                type: Type.OBJECT,
                properties: {
                    fundamental_analysis: analysisReportSchema,
                    technical_analysis: analysisReportSchema,
                    sentiment_analysis: analysisReportSchema
                }
            },
            trading_plan: tradingPlanSchema
        },
        required: ["final_decision", "justification", "source_reports", "trading_plan"]
    };

    const synthesisResponse = await ai.models.generateContent({
        model: config.aiModel,
        contents: synthesisPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: synthesisSchema,
        },
    });
    
    const resultText = synthesisResponse.text.trim();
    const resultJson = JSON.parse(resultText);

    // Gemini might not perfectly nest the source reports in the final response.
    // So we manually ensure they are present.
    if (!resultJson.source_reports || Object.keys(resultJson.source_reports).length === 0) {
        resultJson.source_reports = {
            fundamental_analysis: fundamental,
            technical_analysis: technical,
            sentiment_analysis: sentiment
        };
    }

    return resultJson as AnalysisResult;
};