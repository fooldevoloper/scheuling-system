import { Link } from '@tanstack/react-router';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
                    <span className="text-2xl font-bold text-primary-600">404</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                    <Link to="/dashboard" className="btn-primary">
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
