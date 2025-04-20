'use client';

import React, { useEffect, useState } from "react";
import { fetchSurveys } from "@/services/surveysServices";
import { checkUserAnswer } from "@/services/answersServices";
import { SessionStorageGetItem } from "@/services/storageservices";
import { Logout } from "@/services/userAuthentication";
import SurveyModel from "@/models/surveyModels";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Check,
  LogOut,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

function SurveysDashboard() {
  const [surveys, setSurveys] = useState<SurveyModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answeredSurveys, setAnsweredSurveys] = useState<Record<number, boolean>>({});
  const userId = Number(SessionStorageGetItem('UserId'));
  const router = useRouter();

  const logoutHandler = async (Id: number) => {
    try {
      await Logout(Id);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchSurveys();
      setSurveys(data);
      setError(null);

      // Check answered status for each survey
      const answeredStatus: Record<number, boolean> = {};
      await Promise.all(data.map(async (survey) => {
        try {
          const response = await checkUserAnswer(survey.id, userId);
          answeredStatus[survey.id] = response.hasAnswered;
        } catch (error) {
          console.error(`Error checking answer status for survey ${survey.id}:`, error);
          answeredStatus[survey.id] = false;
        }
      }));
      setAnsweredSurveys(answeredStatus);
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

  const getSurveyStatus = (dueDate: Date, isActive: boolean) => {
    const now = new Date();
    const due = new Date(dueDate);

    if (!isActive || due < now) return 'expired';
    if (due.getTime() - now.getTime() < 86400000 * 3) return 'ending soon'; // 3 days
    return 'active';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'ending soon':
        return <Clock className="text-amber-500" size={18} />;
      case 'expired':
        return <AlertCircle className="text-gray-500" size={18} />;
      default:
        return <AlertCircle className="text-gray-500" size={18} />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Available Surveys</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => logoutHandler(userId)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-red-600"
          >
            <LogOut size={18} />
            Logout
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
          {surveys.map((survey) => {
            const status = getSurveyStatus(survey.dueDate, survey.isActive);
            const isExpired = status === 'expired';
            const hasAnswered = answeredSurveys[survey.id] || false;

            return (
              <div key={survey.id} className={`bg-white rounded-lg shadow-sm border ${hasAnswered ? 'border-green-100' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{survey.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      {hasAnswered ? (
                        <Check className="text-green-500" size={18} />
                      ) : (
                        getStatusIcon(status)
                      )}
                      <span className="capitalize">
                        {hasAnswered ? 'completed' : status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{survey.description}</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Created: {formatDate(survey.created_At)}</span>
                    <span>Due: {formatDate(survey.dueDate)}</span>
                  </div>
                </div>
                {!isExpired && !hasAnswered && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-end">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={()=> router.push(`/surveys/${survey.id}`)}>
                      View Details →
                    </button>
                  </div>
                )}
                {hasAnswered && (
                  <div className="border-t border-green-100 px-5 py-3 bg-green-50 flex justify-between items-center">
                    <span className="text-sm text-green-600 font-medium">
                      Completed ✓
                    </span>
                    <button 
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => router.push(`/surveys/getanswers/${survey.id}`)}
                    >
                      <FileText size={16} />
                      Ver Respuestas
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SurveysDashboard;