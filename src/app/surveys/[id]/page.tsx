'use client'
import { useState, useEffect } from "react";
import { fetchSurveyById } from "@/services/surveysServices";
import { notFound } from 'next/navigation';
import { SessionStorageGetItems } from "@/services/storageservices";
import { useParams } from 'next/navigation';

interface Params {
  id: string;
}

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
  questions: Question[];
}

export default function SurveyDetail() {
  const { id } = useParams(); // Accessing params using useParams
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [answers, setAnswers] = useState<{ question_Id: number; answer_Text: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const surveyData = await fetchSurveyById(Number(id));
        if (!surveyData) {
          setError(true);
        } else {
          setSurvey(surveyData);
          setAnswers(
            surveyData.questions.map((question) => ({
              question_Id: question.id,
              answer_Text: "",
            }))
          );
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return notFound();
  }

  if (loading || !survey) {
    return <div>Loading...</div>;
  }

  const userId = SessionStorageGetItems('UserId');

  const handleAnswerChange = (questionId: number, answerText: string) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.question_Id === questionId
          ? { ...answer, answer_Text: answerText }
          : answer
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5056/api/Answers/answers/${Number(userId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_Id: Number(id), 
          answers: answers, 
        }),
      });

      if (!response.ok) {
        console.error("Failed to submit answers");
      } else {
        console.log("Survey submitted successfully");
      }
    } catch (err) {
      console.error("Error submitting survey:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">{survey.title}</h1>
          <p className="text-gray-600 mt-2">{survey.description}</p>
          <div className="flex gap-4 mt-4 text-sm text-gray-500">
            <span>{survey.questions.length} questions</span>
            <span>Created: {new Date(survey.created_At).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {survey.questions.map((question) => (
            <div key={question.id} className="p-6">
              <h3 className="font-medium text-gray-800">{question.description}</h3>
              <div className="mt-3">
                {question.questionType === "Scale" ? (
                  <div className="flex gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option.id}
                        className={`w-10 h-10 flex items-center justify-center border rounded-full hover:bg-gray-50 ${
                          answers.find(a => a.question_Id === question.id)?.answer_Text === option.optionText
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() =>
                          handleAnswerChange(question.id, option.optionText)
                        }
                      >
                        {option.optionText}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          value={option.optionText}
                          checked={
                            answers.find(a => a.question_Id === question.id)?.answer_Text === option.optionText
                          }
                          onChange={() =>
                            handleAnswerChange(question.id, option.optionText)
                          }
                        />
                        <span>{option.optionText}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleSubmit}
            disabled={answers.some(a => a.answer_Text === "")}
          >
            Submit Survey
          </button>
        </div>
      </div>
    </div>
  );
}
