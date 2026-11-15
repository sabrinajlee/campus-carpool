from flask import current_app


def send_verification_email(to_email, verify_link):
    """For now this prints the link in the backend terminal.

    Task 6 (email sending) replaces the body of this function with a real email
    service call. Nothing else needs to change.
    """
    current_app.logger.warning(
        "\n\n=== VERIFICATION EMAIL (dev mode) ===\nTo: %s\nLink: %s\n=====================================\n",
        to_email,
        verify_link,
    )
