export interface AnalysisConfig {
  aiProvider: string;
  aiModel: string;
  dataVendors: {
    coreStockApi: string;
    technicalIndicators: string;
    fundamentalData: string;
    newsData: string;
  };
  debateRounds: number;
  debugMode: boolean;
}

export interface AnalysisReport {
  analysis_summary: string;
  rating: string;
}

export interface TradingPlan {
  signal: string;
  entry_price: string;
  take_profit_1: string;
  take_profit_2: string;
  stop_loss: string;
  score: string;
  win_rate: string;
  risk_reward_ratio: string;
  reasons: string;
  risks: string;
  action: string;
}

export interface AnalysisResult {
  final_decision: string;
  justification: string;
  source_reports: {
    fundamental_analysis: AnalysisReport;
    technical_analysis: AnalysisReport;
    sentiment_analysis: AnalysisReport;
  };
  trading_plan: TradingPlan;
}