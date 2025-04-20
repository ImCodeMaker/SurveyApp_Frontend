import { getSurveys } from "@/hooks/surveysHook";
import SurveyModel from "@/models/surveyModels";
import { SurveyDetails } from "@/models/surveyRequest";

export const fetchSurveys = async (): Promise<SurveyModel[]> => {
  try {
    const surveys: SurveyModel[] = await getSurveys();
    return surveys;
  } catch (error) {
    throw error;
  }
};


// surveysServices.ts
export const fetchSurveyById = async (id: number): Promise<SurveyDetails> => {
  try {
    const response = await fetch(`http://localhost:5056/survey/${id}`);
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to fetch survey: ${errorDetails}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching survey:', error);
    throw new Error('Failed to fetch survey');
  }
};

export const deleteSurvey = (surveyId: number) => {
  
}