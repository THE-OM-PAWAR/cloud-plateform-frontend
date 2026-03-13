import { UserMenu } from './UserMenu';
import { Link } from 'react-router-dom';

export const DashboardHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-indigo-600">
              CloudDeploy
            </Link>
            <nav className="ml-10 flex gap-6">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Dashboard
              </Link>
              <Link 
                to="/create-project" 
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                New Project
              </Link>
              <Link 
                to="/bash" 
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Terminal
              </Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
