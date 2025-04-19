export default interface SurveyModel {
    id: number;
    title: string;
    description: string;
    created_At: Date;
    dueDate: Date;
    isActive: boolean;
    isPublic: boolean
}