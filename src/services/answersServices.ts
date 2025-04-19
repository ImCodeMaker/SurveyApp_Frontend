export async function checkUserAnswer(surveyId: number, userId: number) {
    const response = await fetch(`http://localhost:5056/api/Answers/check-answer/${surveyId}/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check user answers');
    }
    
    return await response.json();
  }