import { PrismaClient } from "@prisma/client";
import { requireUserSession } from "~/utils/session.server";
import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { validateName, validateEmail, validatePhone } from "~/utils/validators";
import bcrypt from "bcryptjs";
import {  CContainer, CRow,CCard, CCardBody, CCardHeader, CForm, CFormInput, CFormLabel, CButton, CAlert } from "@coreui/react";

const prisma = new PrismaClient();

export async function loader({ request }) {
    const userId = await requireUserSession(request);
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { id: true, name: true, email: true, phone: true }
    });

    if (!user) {
        throw redirect("/login");
    }
    return json({ user });
}

export async function action({ request }) {
    const userId = await requireUserSession(request);
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    const errors = {
        name: validateName(name),
        email: validateEmail(email),
        phone: validatePhone(phone),
        password: null,
    };

    if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
            errors.password = "Current password is required";
        } else {
            const user = await prisma.user.findUnique({ where: { id: parseInt(userId) }, select: { password: true } });
            if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
                errors.password = "Current password is incorrect";
            } else if (newPassword !== confirmPassword) {
                errors.password = "New passwords do not match";
            } else if (newPassword.length < 8) {
                errors.password = "Password must be at least 8 characters";
            }
        }
    }

    if (Object.values(errors).some(error => error !== null)) {
        return json({ errors }, { status: 400 });
    }

    try {
        const updateData = { name, email, phone };
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await prisma.user.update({ where: { id: parseInt(userId) }, data: updateData });
        return redirect("/viewprofile");
    } catch (error) {
        return json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
    }
}

export default function EditProfile() {
    const { user } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <CContainer  className="pt-5 min-vh-100 ">
            <CRow className="pt-5 justify-content-center">
                <CCard>
                    <CCardHeader>Edit Profile</CCardHeader>
                    <CCardBody>
                        {actionData?.error && <CAlert color="danger">{actionData.error}</CAlert>}

                        <CForm method="post">
                            <div className="mb-3">
                                <CFormLabel>Name</CFormLabel>
                                <CFormInput type="text" name="name" defaultValue={user.name} required />
                                {actionData?.errors?.name && <CAlert color="danger">{actionData.errors.name}</CAlert>}
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Email</CFormLabel>
                                <CFormInput type="email" name="email" defaultValue={user.email} required />
                                {actionData?.errors?.email && <CAlert color="danger">{actionData.errors.email}</CAlert>}
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Phone</CFormLabel>
                                <CFormInput type="tel" name="phone" defaultValue={user.phone} required />
                                {actionData?.errors?.phone && <CAlert color="danger">{actionData.errors.phone}</CAlert>}
                            </div>

                            <h5>Change Password</h5>
                            <div className="mb-3">
                                <CFormLabel>Current Password</CFormLabel>
                                <CFormInput type="password" name="currentPassword" />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>New Password</CFormLabel>
                                <CFormInput type="password" name="newPassword" />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Confirm New Password</CFormLabel>
                                <CFormInput type="password" name="confirmPassword" />
                            </div>
                            {actionData?.errors?.password && <CAlert color="danger">{actionData.errors.password}</CAlert>}

                            <CButton type="submit" color="primary" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </CButton>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CRow>
        </CContainer>
    );
}
