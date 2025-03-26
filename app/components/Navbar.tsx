import {
    CNavbar,
    CContainer,
    CNavbarBrand,
    CNavbarNav,
    CNavItem,
    CNavLink,
    CButton,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CBadge,
    CSidebar,
    CSidebarHeader,
    CSidebarBrand,
    CSidebarNav,
    CSidebarToggler
} from "@coreui/react";
import {
    FaHome,
    FaSignInAlt,
    FaUserPlus,
    FaUser,
    FaSignOutAlt,
    FaBook,
    FaTachometerAlt,
    FaUserShield,
    FaCog,
    FaTimes,
    FaBars
} from "react-icons/fa";
import { useUser } from "~/context/UserContext";
import { useState, useEffect } from "react";
import { Form } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";

export default function Navigation() {
    const user = useUser();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const fetcher = useFetcher();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992); // LG breakpoint
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = (event) => {
        event.preventDefault();
        fetcher.submit(null, { method: "post", action: "/api/auth/logout" });
    };

    const handleNavItemClick = () => {
        if (isMobile) {
            setSidebarVisible(false);
        }
    };

    const navContent = (
        <>
            {!user ? (
                // Unauthenticated menu
                <>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/" className="text-white">
                            <FaHome className="me-2" />
                            <span>Home</span>
                        </CNavLink>
                    </CNavItem>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/login" className="text-white">
                            <FaSignInAlt className="me-2" />
                            <span>Login</span>
                        </CNavLink>
                    </CNavItem>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/register" className="text-white">
                            <FaUserPlus className="me-2" />
                            <span>Register</span>
                        </CNavLink>
                    </CNavItem>
                </>
            ) : (
                // Authenticated menu
                <>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/dashboard" className="text-white">
                            <FaTachometerAlt className="me-2" />
                            <span>Dashboard</span>
                        </CNavLink>
                    </CNavItem>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/journals" className="text-white">
                            <FaBook className="me-2" />
                            <span>Journals</span>
                        </CNavLink>
                    </CNavItem>

                    {user.role === "Admin" && (
                        <CDropdown variant="nav-item" className="mx-2">
                            <CDropdownToggle color="light" className="text-white">
                                <FaUserShield className="me-2" />
                                <span>Admin</span>
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem href="/admin/users" onClick={handleNavItemClick}>
                                    <FaUser className="me-2" /> User Management
                                </CDropdownItem>
                                <CDropdownItem href="#" onClick={handleNavItemClick}>
                                    <FaCog className="me-2" /> Settings
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    )}

                    <CDropdown variant="nav-item">
                        <CDropdownToggle color="light" className="text-white">
                            <FaUser className="me-2" />
                            <span>{user.name}</span>
                            {user.role === "Admin" && (
                                <CBadge color="warning" className="ms-2">
                                    Admin
                                </CBadge>
                            )}
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem href="/viewprofile" onClick={handleNavItemClick}>
                                <FaUser className="me-2" /> Profile
                            </CDropdownItem>
                            <CDropdownItem as="div" onClick={handleNavItemClick}>
                                <Form onSubmit={handleLogout}>
                                    <button
                                        type="submit"
                                        className="bg-transparent border-0 text-dark w-100 text-start"
                                    >
                                        <FaSignOutAlt className="me-2" /> Logout
                                    </button>
                                </Form>
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                </>
            )}
        </>
    );

    return (
        <>
            {/* Regular navbar for desktop */}
            <CNavbar expand="lg" colorScheme="light" className="bg-primary text-white fixed-top shadow d-none d-lg-flex">
                <CContainer fluid>
                    <CNavbarBrand href="/" className="text-white fw-bold d-flex align-items-center">
                        <img
                            src="https://images.squarespace-cdn.com/content/v1/5b4bc08596d455c3eeb28f48/0f1735c7-3e00-4dba-98a8-a6986f8b4fd0/Level+Up+Journal+Deals"
                            alt="MyJournal"
                            className="me-2"
                            style={{height: "40px"}}
                        />
                        <span>MyJournal</span>
                    </CNavbarBrand>
                    <CNavbarNav className="ms-auto">
                        {navContent}
                    </CNavbarNav>
                </CContainer>
            </CNavbar>

            {/* Mobile navbar with sidebar toggle */}
            <CNavbar colorScheme="light" className="bg-primary text-white fixed-top shadow d-lg-none">
                <CContainer fluid>
                    <CNavbarBrand href="/" className="text-white fw-bold d-flex align-items-center">
                        <img
                            src="https://images.squarespace-cdn.com/content/v1/5b4bc08596d455c3eeb28f48/0f1735c7-3e00-4dba-98a8-a6986f8b4fd0/Level+Up+Journal+Deals"
                            alt="MyJournal"
                            className="me-2"
                            style={{height: "40px"}}
                        />
                        <span>MyJournal</span>
                    </CNavbarBrand>
                    <CButton
                        color="primary"
                        className="bg-darkblue text-white border-0"
                        onClick={() => setSidebarVisible(!sidebarVisible)}
                    >
                        {sidebarVisible ? <FaTimes /> : <FaBars />}
                    </CButton>
                </CContainer>
            </CNavbar>

            {/* Mobile Sidebar */}
            <div
                className={`d-lg-none position-fixed top-0 start-0 h-100 bg-primary text-white shadow-lg ${sidebarVisible ? 'visible' : 'invisible'}`}
                style={{
                    width: '250px',
                    zIndex: 1040,
                    transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out'
                }}
            >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <CSidebarBrand className="text-white fw-bold">
                        <img
                            src="https://images.squarespace-cdn.com/content/v1/5b4bc08596d455c3eeb28f48/0f1735c7-3e00-4dba-98a8-a6986f8b4fd0/Level+Up+Journal+Deals"
                            alt="MyJournal"
                            style={{height: "40px"}}
                        />
                        MyJournal
                    </CSidebarBrand>
                    <button
                        className="btn btn-link text-white"
                        onClick={() => setSidebarVisible(false)}
                    >
                        <FaTimes />
                    </button>
                </div>
                <CSidebarNav className="p-3">
                    {navContent}
                </CSidebarNav>
            </div>

            {/* Overlay - only closes sidebar, doesn't block clicks to sidebar */}
            {sidebarVisible && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
                    style={{
                        zIndex: 1039,
                        pointerEvents: 'auto' // Allows clicks to pass through to elements beneath
                    }}
                    onClick={() => setSidebarVisible(false)}
                />
            )}
        </>
    );
}