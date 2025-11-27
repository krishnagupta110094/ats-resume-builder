// Environment configuration management
export interface EnvironmentConfig {
  // App Configuration
  APP_ENV: string;
  API_BASE_URL: string;
  AI_SERVICE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;

  // API Configuration
  API_TIMEOUT: number;
  API_RETRY_ATTEMPTS: number;

  // Authentication
  JWT_SECRET: string;
  TOKEN_EXPIRE_TIME: string;

  // AI Service Configuration
  AI_MODEL: string;
  AI_MAX_TOKENS: number;
  AI_TEMPERATURE: number;

  // Feature Flags
  ENABLE_AI_GENERATION: boolean;
  ENABLE_PDF_EXPORT: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG_LOGS: boolean;

  // Storage
  LOCAL_STORAGE_PREFIX: string;
  SESSION_STORAGE_PREFIX: string;
}

class ConfigManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const getEnvVar = (key: string, defaultValue?: string): string => {
      const value = import.meta.env[`VITE_${key}`];
      if (value === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(
          `Environment variable VITE_${key} is required but not defined`
        );
      }
      return value;
    };

    const getBooleanEnvVar = (
      key: string,
      defaultValue: boolean = false
    ): boolean => {
      const value = import.meta.env[`VITE_${key}`];
      return value === "true" || (value === undefined && defaultValue);
    };

    const getNumberEnvVar = (key: string, defaultValue: number): number => {
      const value = import.meta.env[`VITE_${key}`];
      return value ? parseInt(value, 10) : defaultValue;
    };

    const getFloatEnvVar = (key: string, defaultValue: number): number => {
      const value = import.meta.env[`VITE_${key}`];
      return value ? parseFloat(value) : defaultValue;
    };

    return {
      // App Configuration
      APP_ENV: getEnvVar("APP_ENV", "development"),
      API_BASE_URL: getEnvVar(
        "API_BASE_URL",
        "https://crm-backend-iahe.onrender.com"
      ),
      AI_SERVICE_URL: getEnvVar("AI_SERVICE_URL"),
      APP_NAME: getEnvVar("APP_NAME", "ATS Resume Builder"),
      APP_VERSION: getEnvVar("APP_VERSION", "1.0.0"),

      // API Configuration
      API_TIMEOUT: getNumberEnvVar("API_TIMEOUT", 30000),
      API_RETRY_ATTEMPTS: getNumberEnvVar("API_RETRY_ATTEMPTS", 3),

      // Authentication
      JWT_SECRET: getEnvVar("JWT_SECRET"),
      TOKEN_EXPIRE_TIME: getEnvVar("TOKEN_EXPIRE_TIME", "24h"),

      // AI Service Configuration
      AI_MODEL: getEnvVar("AI_MODEL", "gpt-3.5-turbo"),
      AI_MAX_TOKENS: getNumberEnvVar("AI_MAX_TOKENS", 1500),
      AI_TEMPERATURE: getFloatEnvVar("AI_TEMPERATURE", 0.7),

      // Feature Flags
      ENABLE_AI_GENERATION: getBooleanEnvVar("ENABLE_AI_GENERATION", true),
      ENABLE_PDF_EXPORT: getBooleanEnvVar("ENABLE_PDF_EXPORT", true),
      ENABLE_ANALYTICS: getBooleanEnvVar("ENABLE_ANALYTICS", false),
      ENABLE_DEBUG_LOGS: getBooleanEnvVar("ENABLE_DEBUG_LOGS", false),

      // Storage
      LOCAL_STORAGE_PREFIX: getEnvVar("LOCAL_STORAGE_PREFIX", "ats_resume_"),
      SESSION_STORAGE_PREFIX: getEnvVar(
        "SESSION_STORAGE_PREFIX",
        "ats_session_"
      ),
    };
  }

  // Getters for configuration values
  get appConfig() {
    return {
      env: this.config.APP_ENV,
      name: this.config.APP_NAME,
      version: this.config.APP_VERSION,
    };
  }

  get apiConfig() {
    return {
      baseURL: this.config.API_BASE_URL,
      timeout: this.config.API_TIMEOUT,
      retryAttempts: this.config.API_RETRY_ATTEMPTS,
    };
  }

  get aiConfig() {
    return {
      serviceURL: this.config.AI_SERVICE_URL,
      model: this.config.AI_MODEL,
      maxTokens: this.config.AI_MAX_TOKENS,
      temperature: this.config.AI_TEMPERATURE,
    };
  }

  get authConfig() {
    return {
      jwtSecret: this.config.JWT_SECRET,
      tokenExpireTime: this.config.TOKEN_EXPIRE_TIME,
    };
  }

  get featureFlags() {
    return {
      aiGeneration: this.config.ENABLE_AI_GENERATION,
      pdfExport: this.config.ENABLE_PDF_EXPORT,
      analytics: this.config.ENABLE_ANALYTICS,
      debugLogs: this.config.ENABLE_DEBUG_LOGS,
    };
  }

  get storageConfig() {
    return {
      localStoragePrefix: this.config.LOCAL_STORAGE_PREFIX,
      sessionStoragePrefix: this.config.SESSION_STORAGE_PREFIX,
    };
  }

  // Utility methods
  isDevelopment(): boolean {
    return this.config.APP_ENV === "development";
  }

  isProduction(): boolean {
    return this.config.APP_ENV === "production";
  }

  isStaging(): boolean {
    return this.config.APP_ENV === "staging";
  }

  isFeatureEnabled(feature: keyof typeof this.featureFlags): boolean {
    return this.featureFlags[feature];
  }

  log(message: string, ...args: any[]): void {
    if (this.featureFlags.debugLogs) {
      console.log(`[${this.config.APP_NAME}] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.config.APP_NAME}] ERROR: ${message}`, error);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.config.APP_NAME}] WARNING: ${message}`, ...args);
  }
}

// Create singleton instance
export const config = new ConfigManager();

// Export individual configs for convenience
export const {
  appConfig,
  apiConfig,
  aiConfig,
  authConfig,
  featureFlags,
  storageConfig,
} = config;
