import { CFooter } from '@coreui/react'

export default function Footer() {
    return (
        <CFooter className="d-flex justify-content-center align-items-center bg-dark text-white py-3 mt-auto">
            <div>
                &copy; {new Date().getFullYear()} <strong>MyJournal</strong>. All rights reserved.
            </div>
        </CFooter>
    );
}
