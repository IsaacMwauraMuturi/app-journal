// app/components/Navbar.tsx
import { Link } from "@remix-run/react";
import { FaHome, FaSignInAlt, FaUserPlus, FaCaretDown } from "react-icons/fa";

export default function Navbar() {
    return (
        // Todo : Make the Nav Dynamic to Logged in user and Admin
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container-fluid">
                {/* Brand Logo */}
                <Link to="/" className="navbar-brand d-flex align-items-center">
                    <img
                        src="https://via.placeholder.com/40" // Replace with your logo
                        alt="MyJournal Logo"
                        className="me-2"
                        style={{ height: "40px" }}
                    />
                    <span className="fw-bold">MyJournal</span>
                </Link>

                {/* Mobile Toggle Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {/* Home Link */}
                        <li className="nav-item">
                            <Link to="/" className="nav-link d-flex align-items-center">
                                <FaHome className="me-2" />
                                Home
                            </Link>
                        </li>

                        {/* Mega Menu Dropdown */}
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle d-flex align-items-center"
                                href="#"
                                id="megaMenuDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <FaCaretDown className="me-2" />
                                Features
                            </a>
                            <div
                                className="dropdown-menu dropdown-mega-menu"
                                aria-labelledby="megaMenuDropdown"
                            >
                                <div className="row">
                                    <div className="col-md-4">
                                        <h6 className="dropdown-header">Journal Features</h6>
                                        <Link to="/secure" className="dropdown-item">
                                            Secure & Private
                                        </Link>
                                        <Link to="/design" className="dropdown-item">
                                            Beautiful Design
                                        </Link>
                                        <Link to="/access" className="dropdown-item">
                                            Access Anywhere
                                        </Link>
                                    </div>
                                    <div className="col-md-4">
                                        <h6 className="dropdown-header">Tools</h6>
                                        <Link to="/reminders" className="dropdown-item">
                                            Reminders
                                        </Link>
                                        <Link to="/templates" className="dropdown-item">
                                            Templates
                                        </Link>
                                        <Link to="/analytics" className="dropdown-item">
                                            Analytics
                                        </Link>
                                    </div>
                                    <div className="col-md-4">
                                        <h6 className="dropdown-header">Support</h6>
                                        <Link to="/help" className="dropdown-item">
                                            Help Center
                                        </Link>
                                        <Link to="/contact" className="dropdown-item">
                                            Contact Us
                                        </Link>
                                        <Link to="/faq" className="dropdown-item">
                                            FAQ
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {/* Login Link */}
                        <li className="nav-item">
                            <Link to="/login" className="nav-link d-flex align-items-center">
                                <FaSignInAlt className="me-2" />
                                Login
                            </Link>
                        </li>

                        {/* Sign Up Link */}
                        <li className="nav-item">
                            <Link
                                to="/register"
                                className="nav-link btn btn-primary text-white d-flex align-items-center"
                            >
                                <FaUserPlus className="me-2" />
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>


    );
}