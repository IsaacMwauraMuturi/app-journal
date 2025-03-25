import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CButton,
    CAlert,
    CSpinner
} from "@coreui/react";

export default function Login() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setLoading(false);
            } else {
                localStorage.setItem("authToken", data.token);
                window.location.href = "/dashboard";
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <CContainer fluid className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
            <CRow className="w-100 justify-content-center">
                <CCol md={4}>
                    <CCard className="shadow-lg">
                        <CCardHeader className="text-center bg-primary text-white">
                            <h2>Login</h2>
                        </CCardHeader>
                        <CCardBody>
                            {error && <CAlert color="danger">{error}</CAlert>}
                            <CForm method="post" onSubmit={handleSubmit}>
                                <CInputGroup className="mb-3">
                                    <CInputGroupText><FaEnvelope /></CInputGroupText>
                                    <CFormInput
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        required
                                    />
                                </CInputGroup>

                                <CInputGroup className="mb-4">
                                    <CInputGroupText><FaLock /></CInputGroupText>
                                    <CFormInput
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        required
                                    />
                                </CInputGroup>

                                <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                                    {loading ? <CSpinner size="sm" /> : "Login"}
                                </CButton>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
}
