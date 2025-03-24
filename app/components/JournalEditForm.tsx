// app/components/JournalEditForm.tsx
import { useNavigate } from "@remix-run/react";

export default function JournalEditForm({ entry, onSubmit }) {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedEntry = {
            title: formData.get("title"),
            content: formData.get("content"),
            category: formData.get("category"),
            date: formData.get("date"),
        };

        if (onSubmit) {
            await onSubmit(updatedEntry);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={entry.title}
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="content" className="form-label">
                    Content
                </label>
                <textarea
                    id="content"
                    name="content"
                    defaultValue={entry.content}
                    className="form-control"
                    rows="5"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="category" className="form-label">
                    Category
                </label>
                <input
                    type="text"
                    id="category"
                    name="category"
                    defaultValue={entry.category}
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="date" className="form-label">
                    Date
                </label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={new Date(entry.date).toISOString().split("T")[0]}
                    className="form-control"
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">
                Save Changes
            </button>
            <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => navigate(-1)}
            >
                Cancel
            </button>
        </form>
    );
}