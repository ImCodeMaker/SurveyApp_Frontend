'use client'
import { useState, useEffect } from "react";
import { fetchSurveyById } from "@/services/surveysServices";
import { notFound } from 'next/navigation';
import { SessionStorageGetItem } from "@/services/storageservices";
import { useParams } from 'next/navigation';
import { CheckCircle, ChevronDown, ChevronUp, ClipboardList, Clock } from "lucide-react";

interface AnswerDetail {
  questionId: number;
  questionText: string;
  questionType: string;
  answerText: string;  // Mantenemos esta interfaz para uso interno
  answeredAt: string;
}

// Nueva interfaz para la respuesta del API
interface ApiResponse {
  surveyId: number;
  surveyTitle: string;
  answers: {
    questionId: number;
    questionText: string;
    questionType: string;
    userAnswer: string;
    answeredAt: string;
  }[];
}

export default function UserAnswersPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  useEffect(() => {
    const fetchUserAnswers = async () => {
      try {
        const userId = Number(SessionStorageGetItem('UserId'));
        if (!userId) throw new Error("User not logged in");

        // Ya no necesitamos obtener los detalles de la encuesta por separado
        // ya que vienen en la respuesta

        // Obtenemos las respuestas del usuario
        const response = await fetch(`http://localhost:5056/api/Answers/user-responses/${id}/${userId}`);

        if (!response.ok) throw new Error("Failed to fetch answers");

        const responseData: ApiResponse = await response.json();
        
        // Extraemos el título de la encuesta
        setSurveyTitle(responseData.surveyTitle);
        
        // Mapeamos los datos del API a nuestro formato interno
        const formattedAnswers: AnswerDetail[] = responseData.answers.map(answer => ({
          questionId: answer.questionId,
          questionText: answer.questionText,
          questionType: answer.questionType,
          answerText: answer.userAnswer,
          answeredAt: answer.answeredAt
        }));
        
        setAnswers(formattedAnswers);
        
        // Expandir todas las preguntas inicialmente
        setExpandedQuestions(formattedAnswers.map(a => a.questionId));
      } catch (err) {
        console.error("Error fetching answers:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnswers();
  }, [id]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  if (error) {
    return notFound();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Answers Found</h2>
          <p className="text-gray-600">
            You haven't answered this survey yet or your answers couldn't be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <ClipboardList className="text-blue-500" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{surveyTitle}</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <Clock size={16} />
              Answered on: {new Date(answers[0].answeredAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {answers.map((answer) => (
            <div key={answer.questionId} className="group">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleQuestion(answer.questionId)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    answer.answerText ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircle size={16} />
                  </div>
                  <h3 className="font-medium text-gray-800">{answer.questionText}</h3>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600">
                  {expandedQuestions.includes(answer.questionId) ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>
              
              {expandedQuestions.includes(answer.questionId) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">YOUR ANSWER</h4>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {answer.answerText || (
                        <span className="text-gray-400 italic">No answer provided</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}