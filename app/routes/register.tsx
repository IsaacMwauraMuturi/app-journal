import { useState } from "react";
import { CForm, CFormInput, CInputGroup, CInputGroupText, CButton, CAlert, CCard, CCardBody, CCardHeader, CContainer, CRow, CCol } from "@coreui/react";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong");
            } else {
                alert("Registration successful! Please log in.");
                window.location.href = "/login";
            }
        } catch (error) {
            setError("An error occurred, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CContainer className="d-flex min-vh-100 align-items-center justify-content-center p-3">
            <CRow className="justify-content-center w-100">
                <CCol xs={12} sm={10} md={8} lg={6} xl={5}>
                    <CCard className="shadow">
                        <CCardHeader className="text-center fw-bold">Register</CCardHeader>
                        <CCardBody>
                            {error && <CAlert color="danger">{error}</CAlert>}
                            <CForm onSubmit={handleSubmit}>
                                <CInputGroup className="mb-3">
                                    <CInputGroupText><FaUser /></CInputGroupText>
                                    <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                                </CInputGroup>

                                <CInputGroup className="mb-3">
                                    <CInputGroupText><FaEnvelope /></CInputGroupText>
                                    <CFormInput type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                                </CInputGroup>

                                <CInputGroup className="mb-3">
                                    <CInputGroupText><FaPhone /></CInputGroupText>
                                    <CFormInput type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
                                </CInputGroup>

                                <CInputGroup className="mb-3">
                                    <CInputGroupText><FaLock /></CInputGroupText>
                                    <CFormInput type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                                </CInputGroup>

                                <CInputGroup className="mb-4">
                                    <CInputGroupText><FaLock /></CInputGroupText>
                                    <CFormInput type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
                                </CInputGroup>

                                <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                                    {loading ? "Registering..." : "Register"}
                                </CButton>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    );
}