

export interface SurveyOption {
    id: number;
    questionId: number;
    optionText: string;
  }
  
  export interface SurveyQuestion {
    id: number;
    surveyId: number;
    description: string;
    questionType: "Scale" | "MultipleChoice" 
    options: SurveyOption[];
  }
  
  export interface SurveyAnswer {
    id?: number;
    surveyId?: number;
    questionId?: number;
    answerValue?: string;
    answeredAt?: string;
  }
  
  export interface SurveyDetails {
    id: number;
    title: string;
    description: string;
    userId: number;
    isPublic: boolean;
    isActive: boolean;
    created_At: string;
    updated_At?: string; 
    startDate?: string; 
    endDate?: string;
    questions: SurveyQuestion[];
    answers: SurveyAnswer[] | null;
  }
  
  // For API responses
  export interface ApiResponse<T> {
    data?: T;
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  }
  

  export interface PaginatedSurveyResponse {
    items: SurveyDetails[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }