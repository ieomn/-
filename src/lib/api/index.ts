// API Services Export
export { MachineService } from './machine-service';
export { TestService } from './test-service';
export { FileService } from './file-service';
export { AnalysisService } from './analysis-service';
export { UserService } from './user-service';
export { DashboardService } from './dashboard-service';

// Type exports for convenience
export type { MachineModelWithDetails } from './machine-service';
export type { TestSessionWithDetails, TestDataPoint } from './test-service';
export type { FileUploadResult, FileProcessingResult } from './file-service';
export type { AnalysisRequest, ComparisonAnalysisResult, TrendAnalysisResult, StatisticalAnalysisResult } from './analysis-service';
export type { UserStats } from './user-service';
export type { DashboardStats, PerformanceMetrics } from './dashboard-service';