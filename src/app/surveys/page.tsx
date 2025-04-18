'use client'
import React, { useEffect, useState } from "react";
import { fetchSurveys } from "@/services/surveysServices";
import SurveyModel from "@/models/surveyModels";
import { RefreshCw, PlusCircle, AlertCircle, CheckCircle, Clock, BarChart2 } from "lucide-react";

function SurveysDashboard() {
  const [surveys, setSurveys] = useState<SurveyModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchSurveys();
      setSurveys(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setError("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'pending':
        return <Clock className="text-amber-500" size={18} />;
      case 'completed':
        return <BarChart2 className="text-blue-500" size={18} />;
      default:
        return <AlertCircle className="text-gray-500" size={18} />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Survey Management</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle size={18} />
            New Survey
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-600 rounded-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{survey.title}</h3>
                  {/* <div className="flex items-center gap-1 text-sm text-gray-500">
                    {getStatusIcon(survey.status)}
                    <span className="capitalize">{survey.status}</span>
                  </div> */}
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{survey.description}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  {/* <span>Responses: {survey.responseCount || 0}</span>
                  <span>Due: {new Date(survey.endDate).toLocaleDateString()}</span> */}
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-end">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SurveysDashboard;