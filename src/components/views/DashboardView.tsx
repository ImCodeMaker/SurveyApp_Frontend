import React, { useEffect, useState } from "react";
import { fetchSurveys } from "@/services/surveysServices";
import SurveyModel from "@/models/surveyModels";

const DashboardView: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: SurveyModel[] = await fetchSurveys();
        setSurveys(data);
      } catch (error) {
        console.error("Error fetching surveys:", error);
        setError("Failed to load surveys");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading surveys...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <h2 className="text-center font-semibold text-lg mb-4">Survey's Lists</h2>

      {surveys.length === 0 ? (
        <span className="block text-center">No surveys found</span>
      ) : (
        <ul className="space-y-4 w-full max-w-5xl px-4">
          {surveys.map((survey) => (
            <li
              key={survey.id}
              className="bg-gray-100 p-3 rounded-lg shadow hover:bg-gray-200 transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="w-full sm:w-3/4">
                <h3 className="font-semibold text-lg">{survey.title}</h3>
                <p className="text-sm text-gray-600">ID: {survey.id}</p>
                <p className="text-sm mt-1 text-gray-700">{survey.description}</p>
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardView;
