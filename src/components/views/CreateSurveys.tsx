'use client'
import React, { useState } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Copy, Link as LinkIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Definición estricta de tipos
type QuestionType = 'MultipleChoice' | 'Scale';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  scaleRange?: {
    min: number;
    max: number;
  };
}

export default function CreateSurveyForm() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    isPublic: false,
    isActive: true,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });
  const [questions, setQuestions] = useState<Question[]>([{
    id: Date.now().toString(),
    text: '',
    type: 'MultipleChoice' as QuestionType,
    options: ['', '']
  }]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejadores de eventos con tipos correctos
  const handleSurveyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSurvey(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: 'MultipleChoice',
      options: ['', '']
    };
    setQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (expandedQuestion === id) setExpandedQuestion(null);
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
            ...q,
            options: q.options.map((opt, idx) =>
              idx === optionIndex ? value : opt
            )
          }
          : q
      )
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, options: [...q.options, ''] }
          : q
      )
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex)
          }
          : q
      )
    );
  };

  const handleQuestionTypeChange = (id: string, newType: QuestionType) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id
          ? {
            ...q,
            type: newType,
            ...(newType === 'Scale' && {
              options: [],
              scaleRange: { min: 1, max: 5 }
            })
          }
          : q
      )
    );
  };

  const handleScaleRangeChange = (id: string, field: 'min' | 'max', value: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id && q.type === 'Scale'
          ? {
            ...q,
            scaleRange: {
              ...q.scaleRange!,
              [field]: value
            }
          }
          : q
      )
    );
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestion(prev => (prev === id ? null : id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5056/survey/${Number(sessionStorage.getItem('UserId'))}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...survey,
          questions: questions.map(q => ({
            text: q.text,
            question_Type: q.type,
            options: q.type === 'MultipleChoice' ? q.options :
              Array.from(
                { length: (q.scaleRange?.max || 5) - (q.scaleRange?.min || 1) + 1 },
                (_, i) => String((q.scaleRange?.min || 1) + i)
              )
          }))
        }),
      });

      const data = await response.json();

      if (survey.isPublic) {
        const fullPublicUrl = `${window.location.origin}/surveys/${data.id}`;
        setPublicLink(fullPublicUrl);
        toast.success('Encuesta creada y enlace público generado');
      } else {
        toast.success('Encuesta creada exitosamente');
        router.push(`/surveys/${data.id}/edit`);
      }
    } catch (error) {
      toast.error('Error al crear la encuesta');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      toast.info('Enlace copiado al portapapeles');
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    // Resetear el formulario cuando se cierra el modal
    if (isModalOpen) {
      setSurvey({
        title: '',
        description: '',
        isPublic: false,
        isActive: true,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
      setQuestions([{
        id: Date.now().toString(),
        text: '',
        type: 'MultipleChoice' as QuestionType,
        options: ['', '']
      }]);
      setPublicLink(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Botón para abrir el modal */}
      <button
        type="button"
        onClick={toggleModal}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-lg mb-6 shadow-md"
      >
        Abrir Creador de Encuestas
      </button>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-95 flex items-center justify-center z-50 overflow-y-auto">
          <div className="h-screen w-screen p-6 flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Creador de Encuestas</h1>
              <button
                type="button"
                onClick={toggleModal}
                className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Contenido del formulario */}
            <div className="flex-grow overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de información de la encuesta */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <h2 className="text-xl font-medium mb-4">Información de la Encuesta</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                      <input
                        type="text"
                        name="title"
                        value={survey.title}
                        onChange={handleSurveyChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="description"
                        value={survey.description}
                        onChange={handleSurveyChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento *</label>
                        <input
                          type="datetime-local"
                          name="dueDate"
                          value={survey.dueDate}
                          onChange={handleSurveyChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublic"
                          name="isPublic"
                          checked={survey.isPublic}
                          onChange={handleSurveyChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                          Encuesta pública
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={survey.isActive}
                          onChange={handleSurveyChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                          Activar ahora
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de preguntas */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">Preguntas</h2>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <PlusCircle size={18} />
                      Agregar pregunta
                    </button>
                  </div>

                  <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                    {questions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {question.text || "Nueva pregunta"}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {question.type === 'MultipleChoice' ? 'Opción múltiple' : 'Escala'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(question.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                              disabled={questions.length <= 1}
                            >
                              <Trash2 size={16} />
                            </button>
                            {expandedQuestion === question.id ? (
                              <ChevronUp size={16} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={16} className="text-gray-500" />
                            )}
                          </div>
                        </div>

                        {expandedQuestion === question.id && (
                          <div className="p-4 border-t border-gray-200">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la pregunta *</label>
                                <input
                                  type="text"
                                  value={question.text}
                                  onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de pregunta *</label>
                                <select
                                  value={question.type}
                                  onChange={(e) => handleQuestionTypeChange(question.id, e.target.value as QuestionType)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="MultipleChoice">Opción múltiple</option>
                                  <option value="Scale">Escala numérica</option>
                                </select>
                              </div>

                              {question.type === 'MultipleChoice' ? (
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Opciones *</label>
                                    <button
                                      type="button"
                                      onClick={() => addOption(question.id)}
                                      className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                    >
                                      <PlusCircle size={14} />
                                      Agregar opción
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    {question.options.map((option, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => handleOptionChange(question.id, idx, e.target.value)}
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          required
                                        />
                                        {question.options.length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => removeOption(question.id, idx)}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rango de la escala *</label>
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                                        <input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={question.scaleRange?.min || 1}
                                          onChange={(e) => handleScaleRangeChange(question.id, 'min', parseInt(e.target.value))}
                                          className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                                        <input
                                          type="number"
                                          min="2"
                                          max="10"
                                          value={question.scaleRange?.max || 5}
                                          onChange={(e) => handleScaleRangeChange(question.id, 'max', parseInt(e.target.value))}
                                          className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                                    <div className="flex gap-2">
                                      {Array.from(
                                        { length: (question.scaleRange?.max || 5) - (question.scaleRange?.min || 1) + 1 },
                                        (_, i) => (question.scaleRange?.min || 1) + i
                                      ).map((num) => (
                                        <button
                                          key={num}
                                          type="button"
                                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full bg-white hover:bg-gray-100"
                                        >
                                          {num}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

               
                {publicLink && (
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800 mb-3">
                      <LinkIcon size={20} />
                      <h2 className="text-xl font-medium">Enlace público de tu encuesta</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Cualquier persona con este enlace puede responder a tu encuesta.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={publicLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 truncate"
                      />
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Copy size={16} />
                        Copiar
                      </button>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => window.open(publicLink, '_blank')}
                        className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        Ver encuesta pública
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center gap-1 font-medium"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Encuesta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}