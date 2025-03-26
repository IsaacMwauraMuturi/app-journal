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
    CSidebarNav,
    CSidebarBrand
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

    // Handle window resize to determine if mobile view should be applied
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992); // LG breakpoint
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle logout functionality
    const handleLogout = (event) => {
        event.preventDefault();
        fetcher.submit(null, { method: "post", action: "/api/auth/logout" });
    };

    // Close sidebar when a nav item is clicked (only on mobile)
    const handleNavItemClick = () => {
        if (isMobile) {
            setSidebarVisible(false);
        }
    };

    // Navigation content for authenticated and unauthenticated users
    const navContent = (
        <>
            {!user ? (
                // Unauthenticated menu
                <>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/" className="text-white">
                            <FaHome className="me-2" /> Home
                        </CNavLink>
                    </CNavItem>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/login" className="text-white">
                            <FaSignInAlt className="me-2" /> Login
                        </CNavLink>
                    </CNavItem>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/register" className="text-white">
                            <FaUserPlus className="me-2" /> Register
                        </CNavLink>
                    </CNavItem>
                </>
            ) : (
                // Authenticated menu
                <>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/dashboard" className="text-white">
                            <FaTachometerAlt className="me-2" /> Dashboard
                        </CNavLink>
                    </CNavItem>
                    <CNavItem onClick={handleNavItemClick}>
                        <CNavLink href="/journals" className="text-white">
                            <FaBook className="me-2" /> Journals
                        </CNavLink>
                    </CNavItem>
                    {user.role === "Admin" && (
                        <CDropdown variant="nav-item" className="mx-2">
                            <CDropdownToggle color="light" className="text-white">
                                <FaUserShield className="me-2" /> Admin
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
                            <FaUser className="me-2" /> {user.name}
                            {user.role === "Admin" && (
                                <CBadge color="warning" className="ms-2">Admin</CBadge>
                            )}
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem href="/viewprofile" onClick={handleNavItemClick}>
                                <FaUser className="me-2" /> Profile
                            </CDropdownItem>
                            <CDropdownItem as="div" onClick={handleNavItemClick}>
                                <Form onSubmit={handleLogout}>
                                    <button type="submit" className="bg-transparent border-0 text-dark w-100 text-start">
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
            {/* Desktop Navbar */}
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
                    <CNavbarNav className="ms-auto">{navContent}</CNavbarNav>
                </CContainer>
            </CNavbar>

            {/* Mobile Navbar with Sidebar Toggle */}
            <CNavbar colorScheme="light" className="bg-primary text-white fixed-top shadow d-lg-none">
                <CContainer fluid>
                    <CNavbarBrand href="/" className="text-white fw-bold d-flex align-items-center">
                        <span>MyJournal</span>
                    </CNavbarBrand>
                    <CButton color="primary" className="bg-darkblue text-white border-0" onClick={() => setSidebarVisible(!sidebarVisible)}>
                        {sidebarVisible ? <FaTimes /> : <FaBars />}
                    </CButton>
                </CContainer>
            </CNavbar>

            {/* Mobile Sidebar */}
            {sidebarVisible && (
                <div className="position-fixed top-0 start-0 h-100 bg-primary text-white shadow-lg" style={{ width: '250px', zIndex: 1040 }}>
                    <CSidebarBrand className="text-white fw-bold">MyJournal</CSidebarBrand>
                    <CSidebarNav className="p-3">{navContent}</CSidebarNav>
                </div>
            )}
        </>
    );
}
