import { Link } from "@remix-run/react";

export default function Sidebar() {
    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="p-6">
                <h2 className="text-xl font-bold text-purple-600">MyJournal</h2>
                <nav className="mt-6">
                    <Link
                        to="/dashboard"
                        className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/entries"
                        className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                        Entries
                    </Link>
                    <Link
                        to="/profile"
                        className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                        Profile
                    </Link>
                    <Link
                        to="/settings"
                        className="block py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                        Settings
                    </Link>
                </nav>
            </div>
        </div>
    );
}