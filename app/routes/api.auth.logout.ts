import { json, ActionFunctionArgs } from "@remix-run/node";
import { destroySession } from "~/utils/session.server"; // Import session utility

export async function action({ request }: ActionFunctionArgs) {
    const session = await destroySession(request);
    return json({ message: "Logged out successfully" }, {
        status: 200,
        headers: {
            "Set-Cookie": session, // Destroy session by clearing the cookie
        },
    });
}
