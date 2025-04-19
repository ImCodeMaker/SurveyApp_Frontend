"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

interface QuestionStats {
  count: number;
  average: number | null;
  median: number | null;
  mode: string | null;
}

interface SurveyAnalyticsData {
  survey_Id: number;
  questions_Count: number;
  modaGlobal: string;
  modaGlobalCount: number;
  stats_By_Question: Record<string, QuestionStats>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const SurveyAnalyticsDashboard = () => {
  const { id } = useParams();
  const [surveyData, setSurveyData] = useState<SurveyAnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No survey ID provided");
      setLoading(false);
      return;
    }

    const fetchSurveyStats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5056/QuestionsStats/${id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SurveyAnalyticsData = await response.json();

        // Ensure stats_By_Question exists
        if (!data.stats_By_Question) {
          data.stats_By_Question = {};
        }

        setSurveyData(data);
      } catch (err) {
        console.error("Error fetching survey statistics:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load survey statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyStats();
  }, [id]);

  const prepareCharPieData = (questionKey: string) => {
    if (!surveyData?.stats_By_Question?.[questionKey]?.mode) return [];

    const question = surveyData.stats_By_Question[questionKey];
    return [{ name: question.mode, value: question.count || 1 }];
  };

  const prepareRatingData = () => {
    if (!surveyData?.stats_By_Question) return [];

    return Object.entries(surveyData.stats_By_Question)
      .filter(([_, stats]) => stats?.average !== null)
      .map(([question, stats]) => ({
        name:
          question.length > 30 ? `${question.substring(0, 30)}...` : question,
        average: stats.average || 0,
        median: stats.median || 0,
      }));
  };

  const exportToExcel = () => {
    if (!surveyData) return;

    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Survey ID", surveyData.survey_Id],
      ["Total Questions", surveyData.questions_Count],
      ["Global Mode", surveyData.modaGlobal],
      ["Global Mode Count", surveyData.modaGlobalCount],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Questions sheet
    const questionsData = [["Question", "Count", "Median", "Average", "Mode"]];

    Object.entries(surveyData.stats_By_Question).forEach(
      ([question, stats]) => {
        questionsData.push([
          question,
          String(stats.count),
          String(stats.median ?? "N/A)"),
          String(stats.average ?? "N/A"),
          stats.mode ?? "N/A",
        ]);
      }
    );

    const questionsSheet = XLSX.utils.aoa_to_sheet(questionsData);
    XLSX.utils.book_append_sheet(workbook, questionsSheet, "Questions");

    XLSX.writeFile(workbook, `SurveyAnalytics_${surveyData.survey_Id}.xlsx`);
  };

  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      // Capture the dashboard as an image
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit the PDF page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`survey-dashboard-${new Date().toISOString()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export dashboard as PDF');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading statistics...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!surveyData)
    return <div className="text-center p-4">No data available</div>;

  const multipleChoiceQuestions = Object.keys(
    surveyData.stats_By_Question
  ).filter(
    (key) =>
      surveyData.stats_By_Question[key]?.average === null &&
      surveyData.stats_By_Question[key]?.mode !== null
  );

  const ratingQuestions = Object.keys(surveyData.stats_By_Question).filter(
    (key) => surveyData.stats_By_Question[key]?.average !== null
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Survey Analysis</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FileText className="mr-2 h-5 w-5" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Survey ID</p>
          <p className="text-2xl font-bold">{surveyData.survey_Id}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Total Questions</p>
          <p className="text-2xl font-bold">{surveyData.questions_Count}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Global Mode</p>
          <p className="text-2xl font-bold">{surveyData.modaGlobal}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Global Mode Count</p>
          <p className="text-2xl font-bold">{surveyData.modaGlobalCount}</p>
        </div>
      </div>

      {multipleChoiceQuestions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Multiple Choice Questions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {multipleChoiceQuestions.map((questionKey) => (
              <div
                key={questionKey}
                className="bg-gray-50 p-4 rounded-lg shadow"
              >
                <h3 className="text-md font-semibold mb-3">{questionKey}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareCharPieData(questionKey)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {prepareCharPieData(questionKey).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center text-sm text-gray-600">
                  Mode: {surveyData.stats_By_Question[questionKey].mode}
                  (Count: {surveyData.stats_By_Question[questionKey].count})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ratingQuestions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Rating Questions</h2>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareRatingData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" name="Average" fill="#8884d8" />
                  <Bar dataKey="median" name="Median" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {ratingQuestions.map((questionKey) => (
              <div
                key={questionKey}
                className="bg-gray-50 p-4 rounded-lg shadow"
              >
                <h3 className="text-md font-semibold mb-2">{questionKey}</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Average</p>
                    <p className="text-2xl font-bold">
                      {surveyData.stats_By_Question[
                        questionKey
                      ].average?.toFixed(2) ?? "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Median</p>
                    <p className="text-2xl font-bold">
                      {surveyData.stats_By_Question[
                        questionKey
                      ].median?.toFixed(2) ?? "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Mode</p>
                    <p className="text-2xl font-bold">
                      {surveyData.stats_By_Question[questionKey].mode ?? "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Responses</p>
                    <p className="text-2xl font-bold">
                      {surveyData.stats_By_Question[questionKey].count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {multipleChoiceQuestions.length === 0 && ratingQuestions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No question data available for this survey
        </div>
      )}
    </div>
  );
};

export default SurveyAnalyticsDashboard;