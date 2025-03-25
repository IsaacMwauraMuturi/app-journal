// app/routes/profile.edit.tsx
import { PrismaClient } from "@prisma/client";
import { requireUserSession } from "~/utils/session.server";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { validateName, validateEmail, validatePhone } from "~/utils/validators";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
export async function loader({ request }: { request: Request }) {
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

export async function action({ request }: { request: Request }) {
    const userId = await requireUserSession(request);
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate profile inputs
    const errors = {
        name: validateName(name),
        email: validateEmail(email),
        phone: validatePhone(phone),
        password: null as string | null,
    };

    // Password change validation
    if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
            errors.password = "Current password is required to change password";
        } else {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
                select: { password: true }
            });

            if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
                errors.password = "Current password is incorrect";
            } else if (newPassword !== confirmPassword) {
                errors.password = "New passwords do not match";
            } else if (newPassword.length < 8) {
                errors.password = "Password must be at least 8 characters";
            }
        }
    }

    // Return errors if any validation fails
    if (Object.values(errors).some(error => error !== null)) {
        return json({ errors }, { status: 400 });
    }

    try {
        const updateData: {
            name: string;
            email: string;
            phone: string;
            password?: string;
        } = { name, email, phone };

        // Only update password if new password was provided
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: updateData
        });

        return redirect("/viewprofile");
    } catch (error) {
        // Handle unique constraint violations
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            if (error.message.includes("email")) {
                return json(
                    { errors: { email: "This email is already in use" } },
                    { status: 400 }
                );
            }
            if (error.message.includes("phone")) {
                return json(
                    { errors: { phone: "This phone number is already in use" } },
                    { status: 400 }
                );
            }
        }
        return json({
            error: "An unexpected error occurred. Please try again."
        }, { status: 500 });
    }
}

export default function EditProfile() {
    const { user } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const actionData = navigation.formData
        ? null
        : navigation.formAction === navigation.location?.pathname
            ? navigation.json
            : null;

    return (
        // Todo : Add the header
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
            <h1>Edit Profile</h1>
            <Form method="post">
                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            defaultValue={user.name}
                            style={{ width: "100%", padding: "8px" }}
                            required
                        />
                        {actionData?.errors?.name && (
                            <p style={{ color: "red", fontSize: "0.8rem" }}>{actionData.errors.name}</p>
                        )}
                    </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            defaultValue={user.email}
                            style={{ width: "100%", padding: "8px" }}
                            required
                        />
                        {actionData?.errors?.email && (
                            <p style={{ color: "red", fontSize: "0.8rem" }}>
                                {actionData.errors.email}
                            </p>
                        )}
                    </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Phone:
                        <input
                            type="tel"
                            name="phone"
                            defaultValue={user.phone}
                            style={{ width: "100%", padding: "8px" }}
                            required
                        />
                        {actionData?.errors?.phone && (
                            <p style={{ color: "red", fontSize: "0.8rem" }}>
                                {actionData.errors.phone}
                            </p>
                        )}
                    </label>
                </div>

                <div style={{ margin: "30px 0 15px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                    <h3>Change Password</h3>

                    <div style={{ marginBottom: "15px" }}>
                        <label>
                            Current Password:
                            <input
                                type="password"
                                name="currentPassword"
                                style={{ width: "100%", padding: "8px" }}
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>
                            New Password:
                            <input
                                type="password"
                                name="newPassword"
                                style={{ width: "100%", padding: "8px" }}
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>
                            Confirm New Password:
                            <input
                                type="password"
                                name="confirmPassword"
                                style={{ width: "100%", padding: "8px" }}
                            />
                        </label>
                    </div>

                    {actionData?.errors?.password && (
                        <p style={{ color: "red", fontSize: "0.8rem" }}>
                            {actionData.errors.password}
                        </p>
                    )}
                </div>

                {actionData?.error && !actionData?.errors && (
                    <p style={{ color: "red", marginBottom: "15px" }}>
                        {actionData.error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: "10px 15px",
                        background: isSubmitting ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </Form>
        </div>
    );
}