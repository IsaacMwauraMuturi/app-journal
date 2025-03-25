// app/routes/_index.tsx
import { useEffect } from "react";
import { useNavigate, Link } from "@remix-run/react";
import { useUser } from "~/context/UserContext"; // Import User Context

export default function Index() {
    const user = useUser(); // Get logged-in user
    const navigate = useNavigate(); // Navigation hook

    useEffect(() => {
        if (user) {
            navigate("/dashboard"); // Redirect if authenticated
        }
    }, [user, navigate]);
    return (
        <div className="font-sans bg-light text-dark">
            {/* Navbar */}


            {/* Hero Section */}
            <section
                className="position-relative vh-100 d-flex flex-column justify-content-center align-items-center text-center text-white"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
                <div className="position-relative z-10 px-4">
                    <h1 className="display-1 fw-bold mb-4">
                        Empower Your Mind, One Journal at a Time
                    </h1>
                    <p className="fs-4 mb-5">
                        A safe space to reflect, express, and grow. Track your mental health journey with ease.
                    </p>
                    <div className="d-flex gap-4 justify-content-center">
                        <Link
                            to="/login"
                            className="btn btn-light text-primary fw-bold px-5 py-3 rounded shadow-lg"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-outline-light fw-bold px-5 py-3 rounded shadow-lg"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-5 bg-light text-center">
                <div className="container">
                    <h2 className="display-4 fw-bold mb-5">How It Works</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 shadow-sm p-4">
                                <h3 className="fw-bold">Write & Reflect</h3>
                                <p className="text-muted">Jot down your thoughts, track your emotions, and reflect on your day.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 shadow-sm p-4">
                                <h3 className="fw-bold">AI Insights</h3>
                                <p className="text-muted">Analyze your mental state over time with intelligent AI-based reports.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 shadow-sm p-4">
                                <h3 className="fw-bold">Stay Motivated</h3>
                                <p className="text-muted">Daily affirmations and progress tracking to keep you on track.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-5 bg-white text-center">
                <div className="container">
                    <h2 className="display-4 fw-bold mb-5">What Our Users Say</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <blockquote className="blockquote">
                                <p className="fs-5">"This app changed my life. Writing my thoughts daily has improved my mental clarity!"</p>
                                <footer className="blockquote-footer">Jane Doe</footer>
                            </blockquote>
                        </div>
                        <div className="col-md-4">
                            <blockquote className="blockquote">
                                <p className="fs-5">"I love the insights and analytics. Helps me understand my emotions better."</p>
                                <footer className="blockquote-footer">John Smith</footer>
                            </blockquote>
                        </div>
                        <div className="col-md-4">
                            <blockquote className="blockquote">
                                <p className="fs-5">"Simple, beautiful, and effective. A must-have for mental wellness."</p>
                                <footer className="blockquote-footer">Sarah Lee</footer>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-5 bg-primary text-white text-center">
                <div className="container">
                    <h2 className="display-4 fw-bold mb-4">Start Your Journey Today</h2>
                    <p className="fs-5">Join thousands of users improving their mental health through journaling.</p>
                    <Link to="/register" className="btn btn-light fw-bold px-5 py-3 mt-3 rounded shadow-lg">Sign Up for Free</Link>
                </div>
            </section>

            {/* Footer */}

        </div>
    );
}