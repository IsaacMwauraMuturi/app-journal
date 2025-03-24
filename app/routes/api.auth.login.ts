import { json, type ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import validator from "validator"; // Email validation
import { setSession } from "~/utils/session.server"; // Import session utility

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use a strong secret key

// **POST Request Handler** (Action)
export async function action({ request }: ActionFunctionArgs) {
    try {
        // Parse the JSON body from the request
        const formData = await request.json();
        const { email, password } = formData;

        // Input validation
        if (!email || !password) {
            return json({ error: "Email and password are required" }, { status: 400 });
        }

        if (!validator.isEmail(email)) {
            return json({ error: "Invalid email format" }, { status: 400 });
        }

        const sanitizedEmail = validator.normalizeEmail(email);
        const sanitizedPassword = password.trim();

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: {
                email: sanitizedEmail,
            },
        });

        if (!user) {
            return json({ error: "Invalid credentials" }, { status: 400 });
        }

        // Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);

        if (!isPasswordValid) {
            return json({ error: "Invalid credentials" }, { status: 400 });
        }

        // Set session data for the user (userId and email)
        const session = await setSession(request, user.id, user.email);

        // Return success message and set session cookie
        return json({ message: "Login successful" }, {
            status: 200,
            headers: {
                "Set-Cookie": session, // Set the session cookie
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return json({ error: "An error occurred during login. Please try again later." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
