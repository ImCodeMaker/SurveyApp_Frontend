import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

function DeleteSurveys() {
  const [id, setId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setId(event.currentTarget.value);
  };

  const handleDelete = async () => {
    if (!id) {
      toast.error("Please enter a Survey ID");
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:5056/api/Surveys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success("Survey deleted successfully!");
      setId("");
      router.refresh(); // Refresh the page to update the survey list
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast.error(`Failed to delete survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-md w-full max-w-md mx-auto border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Trash2 className="text-red-500" size={24} />
        <h1 className="font-bold text-xl text-gray-800">Delete Survey</h1>
      </div>
      
      <div className="w-full h-px bg-gray-200 mb-6"></div>
      
      <p className="text-sm text-gray-600 italic mb-6 text-center">
        Please enter the SurveyID you wish to delete
      </p>
      
      <div className="w-full mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="surveyId">
          Survey ID
        </label>
        <div className="relative">
          <input
            id="surveyId"
            type="text"
            value={id}
            onChange={handleChange}
            placeholder="Enter the Survey ID..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            disabled={isDeleting}
          />
        </div>
      </div>
      
      <button 
        type="button"
        onClick={handleDelete}
        disabled={isDeleting || !id}
        className={`flex items-center justify-center w-full px-4 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
          isDeleting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }`}
      >
        {isDeleting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="mr-2" size={16} />
            Delete Survey
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        This action cannot be undone. Please confirm the ID is correct.
      </p>
    </div>
  );
}

export default DeleteSurveys;