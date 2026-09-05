'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { RoomsClient } from '@/app/dashboard/rooms/RoomsClient';
import { TeachersClient } from '@/app/dashboard/teachers/TeachersClient';
import { SectionsClient } from '@/app/dashboard/sections/SectionsClient';
import { SubjectsClient } from '@/app/dashboard/subjects/SubjectsClient';

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'sections', label: 'Sections' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'done', label: 'Complete' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WizardFlow({ rooms, teachers, sections, subjects }: { rooms: any, teachers: any, sections: any, subjects: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
    else router.push('/dashboard/timetable');
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  return (
    <div className="flex flex-col h-full -mx-6 -mt-6 md:-mx-8 md:-mt-8">
      {/* Wizard Header Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900">Setup Wizard</h2>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx === currentStep 
                      ? 'bg-blue-600 text-white'
                      : idx < currentStep 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx < currentStep ? <Check size={16} /> : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="flex-1 overflow-auto p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
          
          {currentStep === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Welcome to Timetable Scheduler</h2>
              <p className="text-lg text-gray-600 max-w-lg mb-8">
                This wizard will guide you through setting up your master data. You&apos;ll add your physical rooms, teaching staff, student sections, and the curriculum subjects.
              </p>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg shadow-sm"
              >
                Let&apos;s get started <ArrowRight size={20} />
              </button>
            </div>
          )}

          {currentStep === 1 && <div className="p-6"><RoomsClient initialData={rooms} /></div>}
          
          {currentStep === 2 && <div className="p-6"><TeachersClient initialData={teachers} /></div>}
          
          {currentStep === 3 && <div className="p-6"><SectionsClient initialData={sections} /></div>}
          
          {currentStep === 4 && <div className="p-6"><SubjectsClient initialData={subjects} sections={sections} teachers={teachers} /></div>}

          {currentStep === 5 && (
            <div className="p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Check size={32} />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">You&apos;re all set!</h2>
              <p className="text-lg text-gray-600 max-w-lg mb-8">
                Your master data has been configured. You can now start generating automated timetables.
              </p>
              <button
                onClick={() => router.push('/dashboard/timetable')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg shadow-sm"
              >
                Go to Timetables <ArrowRight size={20} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Wizard Footer Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200'
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          {currentStep > 0 && currentStep < STEPS.length - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Continue <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
