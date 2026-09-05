import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome to the Timetable Scheduler admin panel.</p>
      
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-start">
          <h2 className="text-xl font-semibold mb-2">First time here?</h2>
          <p className="text-gray-600 mb-6 flex-1">
            Use the Setup Wizard to quickly configure all your master data including rooms, teachers, sections, and subjects in a guided flow.
          </p>
          <Link 
            href="/dashboard/setup" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Start Setup Wizard
          </Link>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-start">
          <h2 className="text-xl font-semibold mb-2">Generate Timetable</h2>
          <p className="text-gray-600 mb-6 flex-1">
            Once your master data is ready, head over to the Timetable engine to automatically generate and resolve conflicts.
          </p>
          <Link 
            href="/dashboard/timetable" 
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition-colors border border-gray-300"
          >
            View Timetables
          </Link>
        </div>
      </div>
    </div>
  );
}
