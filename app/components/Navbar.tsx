import {
    CNavbar,
    CContainer,
    CNavbarBrand,
    CNavbarNav,
    CNavItem,
    CNavLink,
    CCollapse,
    CButton,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from "@coreui/react";
import { FaHome, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useUser } from "~/context/UserContext";
import { useState } from "react";
import { Form } from "@remix-run/react";
import { useFetcher } from "@remix-run/react"; // Import useFetcher
export default function Navbar() {
    const user = useUser(); // Get authenticated user
    const [visible, setVisible] = useState(false); // Toggle menu visibility
    const fetcher = useFetcher(); // Initialize fetcher for AJAX requests
    const handleLogout = (event: React.FormEvent) => {
        event.preventDefault(); // Prevent full-page reload
        fetcher.submit(null, { method: "post", action: "/api/auth/logout" });
    };
    return (
        <CNavbar expand="lg" colorScheme="light" className="bg-primary text-white fixed-top shadow">
            <CContainer fluid>
                <CNavbarBrand href="/" className="text-white fw-bold">
                    <img
                        src="https://images.squarespace-cdn.com/content/v1/5b4bc08596d455c3eeb28f48/0f1735c7-3e00-4dba-98a8-a6986f8b4fd0/Level+Up+Journal+Deals"
                        alt="MyJournal"
                        className="me-2"
                        style={{height: "40px"}}
                    />

                </CNavbarBrand>

                {/* Toggle button for small screens */}
                <CButton
                    color="light"
                    className="d-lg-none text-white"
                    onClick={() => setVisible(!visible)}
                >
                    ☰
                </CButton>

                <CCollapse className="navbar-collapse" visible={visible}>
                    <CNavbarNav className="ms-auto">
                        <CNavItem>
                            <CNavLink href="/" className="text-white">
                                <FaHome className="me-2" /> Home
                            </CNavLink>
                        </CNavItem>

                        {!user ? (
                            <>
                                <CNavItem>
                                    <CNavLink href="/login" className="text-white">
                                        <FaSignInAlt className="me-2" /> Login
                                    </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                    <CNavLink href="/register" className="text-white">
                                        <FaUserPlus className="me-2" /> Register
                                    </CNavLink>
                                </CNavItem>
                            </>
                        ) : (
                            <CDropdown variant="nav-item">
                                <CDropdownToggle color="light" className="text-white">
                                    <FaUser className="me-2" /> {user.name}
                                </CDropdownToggle>
                                <CDropdownMenu>
                                    <CDropdownItem href="/viewprofile">
                                        <FaUser className="me-2" /> Profile
                                    </CDropdownItem>
                                    <CDropdownItem as="div">
                                        <form onSubmit={handleLogout}>
                                            <button type="submit" className="bg-transparent border-0 text-dark">
                                                <FaSignOutAlt className="me-2" /> Logout
                                            </button>
                                        </form>
                                    </CDropdownItem>
                                </CDropdownMenu>
                            </CDropdown>
                        )}
                    </CNavbarNav>
                </CCollapse>
            </CContainer>
        </CNavbar>
    );
}
