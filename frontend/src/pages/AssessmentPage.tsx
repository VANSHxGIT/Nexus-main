import React, { useState } from 'react';
import { ProctoringView } from '../components/ProctoringView';
import { useParams } from 'react-router-dom';

export const AssessmentPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [cameraCovered, setCameraCovered] = useState(false);

  // Example mock questions
  const questions = [
    "Explain the difference between optimistic and pessimistic concurrency control.",
    "How would you design a distributed rate limiter?",
    "Describe a time you had to debug a complex memory leak in production."
  ];

  return (
    <div className="w-full max-w-container-max mx-auto px-gutter py-12 flex gap-8">
      
      {/* Left side: The Assessment Content */}
      <div className={`flex-1 bg-surface-base border rounded-2xl p-8 shadow-sm transition-colors ${cameraCovered ? 'border-red-400 bg-red-50' : 'border-border-low-contrast'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${cameraCovered ? 'text-red-700' : 'text-text-primary'}`}>
          {cameraCovered ? 'Assessment Paused (Camera Alert)' : 'Technical Assessment'}
        </h2>
        
        <div className="mb-8">
          <p className="text-sm text-text-secondary uppercase tracking-wider font-bold mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h3 className="text-xl text-text-primary leading-relaxed font-medium">
            {questions[currentQuestion]}
          </h3>
        </div>

        <textarea 
          className="w-full h-48 bg-surface-subtle border border-border-low-contrast rounded-xl p-4 text-text-primary font-body-md focus:outline-none focus:border-primary transition-colors resize-none"
          style={{
            backgroundColor: cameraCovered ? '#d1d5db' : undefined,
            cursor: cameraCovered ? 'not-allowed' : 'text'
          }}
          placeholder={cameraCovered ? "Camera covered. Action disabled." : "Write your answer here..."}
          disabled={cameraCovered}
        />

        <div className="flex justify-between mt-6">
          <button 
            disabled={currentQuestion === 0 || cameraCovered}
            onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
            className="px-6 py-2 rounded-lg bg-surface-subtle border border-border-low-contrast text-text-primary hover:bg-surface-base transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            disabled={cameraCovered}
            onClick={() => {
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(q => q + 1);
              } else {
                alert("Assessment Submitted!");
              }
            }}
            className="px-6 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors"
          >
            {currentQuestion === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
          </button>
        </div>
      </div>

      {/* Right side: Proctoring View */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <ProctoringView matchId={matchId || 'test-match-id'} onWarningChange={setCameraCovered} />
        
        <div className="bg-surface-subtle border border-border-low-contrast rounded-xl p-4">
          <h4 className="font-semibold text-text-primary mb-2 text-sm">Proctoring Rules</h4>
          <ul className="text-sm text-text-secondary space-y-2 list-disc pl-4">
            <li>Ensure your face is clearly visible.</li>
            <li>Maintain focus on the screen.</li>
            <li>No additional persons allowed in the frame.</li>
            <li>Violations will be automatically logged.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
