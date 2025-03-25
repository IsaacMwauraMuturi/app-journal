export function validateName(name: string): string | null {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 50) return "Name must be less than 50 characters";
    return null;
}

export function validateEmail(email: string): string | null {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Please enter a valid email address";
    }
    return null;
}

export function validatePhone(phone: string): string | null {
    if (!phone) return "Phone is required";
    // Basic phone validation - adjust as needed
    if (!/^[\d\s\-+()]{8,20}$/.test(phone)) {
        return "Please enter a valid phone number";
    }
    return null;
}