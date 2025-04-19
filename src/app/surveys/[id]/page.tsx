'use client'
import { useState, useEffect } from "react";
import { fetchSurveyById } from "@/services/surveysServices";
import { notFound } from 'next/navigation';
import { SessionStorageGetItem } from "@/services/storageservices";
import { useParams } from 'next/navigation';

interface Question {
  id: number;
  description: string;
  questionType: string;
  options: {
    id: number;
    optionText: string;
  }[];
}

interface Survey {
  id: number;
  title: string;
  description: string;
  created_At: string;
  dueDate: string;
  questions: Question[];
}

export default function SurveyDetail() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<{ question_Id: number; answer_Text: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(SessionStorageGetItem('UserId'));
        const surveyData = await fetchSurveyById(Number(id));
        
        if (!surveyData) {
          setError(true);
          return;
        }

        setSurvey(surveyData);
        
        // Initialize answers array
        setAnswers(
          surveyData.questions.map((question) => ({
            question_Id: question.id,
            answer_Text: ""
          }))
        );

        // Check expiration
        if (surveyData.dueDate) {
          const now = new Date();
          const expirationDate = new Date(surveyData.dueDate);
          setIsExpired(now > expirationDate);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAnswerChange = (questionId: number, answerText: string) => {
    setAnswers(prevAnswers => 
      prevAnswers.map(answer => 
        answer.question_Id === questionId
          ? { ...answer, answer_Text: answerText }
          : answer
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const userId = Number(SessionStorageGetItem('UserId'));
      const surveyId = Number(id);
      
      if (!userId || !surveyId) {
        throw new Error('Missing user ID or survey ID');
      }

      const response = await fetch(`http://localhost:5056/api/Answers/answers/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_Id: surveyId,
          answers: answers.filter(a => a.answer_Text !== ""),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        throw new Error(errorData.message || 'Failed to submit answers');
      }
      
      setHasAnswered(true);
    } catch (err) {
      console.error("Error submitting survey:", err);
    }
  };

  if (error) {
    return notFound();
  }

  if (loading || !survey) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (hasAnswered) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-xl font-bold text-green-600 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            You have already completed this survey. We appreciate your participation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {isExpired ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Survey Expired</h2>
          <p className="text-gray-600">
            This survey is no longer accepting responses as it expired on {new Date(survey.dueDate).toLocaleDateString()}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">{survey.title}</h1>
            <p className="text-gray-600 mt-2">{survey.description}</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              <span>{survey.questions.length} questions</span>
              <span>Created: {new Date(survey.created_At).toLocaleDateString()}</span>
              {survey.dueDate && (
                <span>Expires: {new Date(survey.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {survey.questions.map((question) => (
              <div key={question.id} className="p-6">
                <h3 className="font-medium text-gray-800">{question.description}</h3>
                <div className="mt-3">
                  {question.questionType === "Scale" ? (
                    <div className="flex gap-2 flex-wrap">
                      {question.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`min-w-10 h-10 px-2 flex items-center justify-center border rounded-full hover:bg-gray-50 transition-colors ${
                            answers.find(a => a.question_Id === question.id)?.answer_Text === option.optionText
                              ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                              : 'border-gray-200'
                          }`}
                          onClick={() => handleAnswerChange(question.id, option.optionText)}
                        >
                          {option.optionText}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label 
                          key={option.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            answers.find(a => a.question_Id === question.id)?.answer_Text === option.optionText
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.optionText}
                            checked={
                              answers.find(a => a.question_Id === question.id)?.answer_Text === option.optionText
                            }
                            onChange={() => handleAnswerChange(question.id, option.optionText)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="flex-1">{option.optionText}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              onClick={handleSubmit}
              disabled={
                answers.every(a => a.answer_Text === "") || 
                isExpired || 
                hasAnswered
              }
            >
              {hasAnswered ? 'Already Answered' : isExpired ? 'Survey Expired' : 'Submit Survey'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}