// app/routes/_index.tsx
import { Link } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

export default function Index() {
    return (
        <div className="font-sans bg-light text-dark">
            {/* Navbar */}
            <Navbar />

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
                        Your Personal Journal
                    </h1>
                    <p className="fs-4 mb-5">
                        Capture your thoughts, memories, and ideas in a secure and beautiful space.
                    </p>
                    <div className="d-flex gap-4 justify-content-center">
                        <Link
                            to="/login"
                            className="btn btn-light text-purple fw-bold px-5 py-3 rounded"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-outline-light fw-bold px-5 py-3 rounded"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5 bg-white">
                <div className="container">
                    <h2 className="text-center display-4 fw-bold mb-5">
                        Features
                    </h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src="https://images.pexels.com/photos/356043/pexels-photo-356043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                    alt="Secure & Private"
                                    className="card-img-top"
                                />
                                <div className="card-body text-center p-4">
                                    <h3 className="card-title fs-3 fw-bold mb-3">Secure & Private</h3>
                                    <p className="card-text text-muted">
                                        Your journal is encrypted and accessible only by you. Keep your thoughts safe.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src="https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                    alt="Beautiful Design"
                                    className="card-img-top"
                                />
                                <div className="card-body text-center p-4">
                                    <h3 className="card-title fs-3 fw-bold mb-3">Beautiful Design</h3>
                                    <p className="card-text text-muted">
                                        A clean and intuitive interface designed for focus and creativity.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                    alt="Access Anywhere"
                                    className="card-img-top"
                                />
                                <div className="card-body text-center p-4">
                                    <h3 className="card-title fs-3 fw-bold mb-3">Access Anywhere</h3>
                                    <p className="card-text text-muted">
                                        Available on all devices. Write anytime, anywhere.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/*<Footer />*/}
        </div>
    );
}