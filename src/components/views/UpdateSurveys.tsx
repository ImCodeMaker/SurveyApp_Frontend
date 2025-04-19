import { useState, useEffect } from 'react';
import { fetchSurveyById } from "@/services/surveysServices";
import { toast } from 'react-toastify';
import { Search, RefreshCw, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';

interface Survey {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  isActive: boolean;
}

const SurveyEditor = () => {
  const [surveyId, setSurveyId] = useState<string>('');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle survey fetching when ID changes
  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId.trim()) {
        setSurvey(null);
        return;
      }

      setIsLoading(true);
      try {
        const idNumber = parseInt(surveyId);
        if (isNaN(idNumber)) throw new Error('Invalid ID format');
        
        const data = await fetchSurveyById(idNumber);
        setSurvey(data);
        toast.success('Survey loaded', { icon: <CheckCircle className="text-green-500" /> });
      } catch (error) {
        setSurvey(null);
        toast.error(error instanceof Error ? error.message : 'Failed to load survey', {
          icon: <XCircle className="text-red-500" />
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      loadSurvey();
    }, 500); // Basic debounce to prevent rapid requests

    return () => clearTimeout(debounceTimer);
  }, [surveyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5056/survey/${survey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(survey)
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success('Survey updated successfully', {
        icon: <CheckCircle className="text-green-500" />
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed', {
        icon: <XCircle className="text-red-500" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSurvey(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    } : null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Survey Editor</h1>
        
        {/* Search Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Survey by ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
              placeholder="Enter survey ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {isLoading && (
              <div className="flex items-center px-4">
                <RefreshCw className="animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>

        {/* Editor Form */}
        {survey ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={survey.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={survey.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={survey.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Public Survey</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={survey.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Active Survey</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {surveyId ? 'No survey found with this ID' : 'Enter a survey ID to begin editing'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyEditor;