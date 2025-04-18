import SurveyModel from "@/models/surveyModels";

export const getSurveys = async (): Promise<SurveyModel[]> => {
  try {
    const response = await fetch("http://localhost:5056/surveys");

    if (!response.ok) throw new Error("Error fetching the data, try again!");

    const data: SurveyModel[] = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};


