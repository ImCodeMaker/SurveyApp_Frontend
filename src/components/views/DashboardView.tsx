import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSurveys, fetchSurveyById } from "@/services/surveysServices";
import SurveyModel from "@/models/surveyModels";
import { Copy, Check } from "lucide-react";

interface Option {
  id: number;
  questionId: number;
  optionText: string;
}

interface Question {
  surveyId: number;
  description: string;
  questionType: string;
  options: Option[];
}

interface Survey extends SurveyModel {
  userId: number;
  questions: Question[];
  answers: null | any[];
}

const DashboardView: React.FC = () => {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSurveys();
        const convertedSurveys = data.map(survey => ({
          ...survey,
          userId: 0,
          questions: [],
          answers: null
        }));
        setSurveys(convertedSurveys);
      } catch (error) {
        console.error("Error fetching surveys:", error);
        setError("Failed to load surveys");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSurveyClick = (surveyId: number) => {
    router.push(`/admin/analytics/${surveyId}`);
  };

  const duplicateSurvey = async (surveyId: number) => {
    try {
      setCopiedId(surveyId);
      
      const originalSurvey = await fetchSurveyById(surveyId);
      
      // Prepare the duplicated survey with the exact structure your backend expects
      const duplicatedSurvey = {
        title: `${originalSurvey.title} (Copy)`,
        description: originalSurvey.description,
        isPublic: originalSurvey.isPublic,
        isActive: originalSurvey.isActive,
        dueDate: new Date().toISOString(),
        questions: originalSurvey.questions?.map(question => ({
          text: question.description, // Changed from 'description' to 'text' if that's what backend expects
          question_Type: question.questionType, // Changed to match your earlier template
          options: question.options.map(option => option.optionText) // Just the option texts
        })) || []
      };

      const userId = Number(sessionStorage.getItem('UserId'));
      if (!userId) {
        throw new Error('User ID not found in session');
      }

      const response = await fetch(`http://localhost:5056/survey/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedSurvey),
      });

      if (!response.ok) {
        // Try to get more detailed error info from the response
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to duplicate survey');
      }

      // Refresh the survey list
      const data = await fetchSurveys();
      const updatedSurveys = data.map(survey => ({
        ...survey,
        userId: 0,
        questions: [],
        answers: null
      }));
      setSurveys(updatedSurveys);

      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Error duplicating survey:", error);
      setError(error instanceof Error ? error.message : "Failed to duplicate survey");
      setCopiedId(null);
    }
  };

  if (loading) return <p className="text-center p-4">Loading surveys...</p>;
  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <h2 className="text-center font-semibold text-lg mb-4">Survey's Lists</h2>

      {surveys.length === 0 ? (
        <span className="block text-center">No surveys found</span>
      ) : (
        <div className="w-full max-w-5xl px-4 max-h-[300px] overflow-y-auto">
          <ul className="space-y-4">
            {surveys.map((survey) => (
              <li
                key={survey.id}
                className="bg-gray-100 p-3 rounded-lg shadow hover:bg-gray-200 transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div 
                  className="w-full sm:w-3/4 cursor-pointer"
                  onClick={() => handleSurveyClick(survey.id)}
                >
                  <h3 className="font-semibold text-lg">{survey.title}</h3>
                  <p className="text-sm text-gray-600">ID: {survey.id}</p>
                  <p className="text-sm text-gray-700 mt-1">{survey.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Due Date: {new Date(survey.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      survey.isPublic
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {survey.isPublic ? "Public" : "Private"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      survey.isActive
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {survey.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSurvey(survey.id);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Duplicate survey"
                    disabled={copiedId === survey.id}
                  >
                    {copiedId === survey.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardView;