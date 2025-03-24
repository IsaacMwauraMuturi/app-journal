export default function Footer() {
    return (
        <footer className="py-8 px-4 bg-gray-900 text-white text-center mt-auto">
            <p className="text-sm">
                &copy; {new Date().getFullYear()} MyJournal. All rights reserved.
            </p>
        </footer>
    );
}