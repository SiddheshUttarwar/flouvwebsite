"""Server-side email notification for new inquiries, sent via Gmail SMTP
with an App Password. This is the reliable counterpart to the frontend's
mailto: draft, which silently does nothing if the visitor's browser has no
mail client configured.

Requires GMAIL_SMTP_USER (the Gmail address sending FROM) and
GMAIL_SMTP_APP_PASSWORD (an App Password, not the account's normal login
password — Google requires 2-Step Verification enabled to generate one, at
myaccount.google.com/apppasswords) to be set. If either is missing, sending
is skipped rather than failing the inquiry submission itself — storing the
lead server-side is the part that must never fail."""
import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger("flouv.email_notify")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
NOTIFY_TO = os.getenv("INQUIRY_NOTIFY_EMAIL", "pankajuttarwar@flouv.us")
SITE_BASE_URL = os.getenv("SITE_BASE_URL", "https://flouv.us")


def send_inquiry_notification(inquiry, extra_to: str | None = None) -> None:
    """`inquiry` is a models.Inquiry row (already committed). Never raises —
    a failed notification email must not affect the inquiry submission
    response, since the lead is already safely persisted at that point.

    `extra_to` additionally routes the notification to a specific FloUV
    contact (e.g. "Connect with Dirk" should reach Dirk himself, not just
    the general inbox every other inquiry lands in) — sent alongside, not
    instead of, NOTIFY_TO, since someone should always see every inquiry."""
    smtp_user = os.getenv("GMAIL_SMTP_USER")
    smtp_password = os.getenv("GMAIL_SMTP_APP_PASSWORD")
    if not smtp_user or not smtp_password:
        logger.warning("GMAIL_SMTP_USER/GMAIL_SMTP_APP_PASSWORD not set — skipping inquiry notification email")
        return

    label = (inquiry.mode or "inquiry").replace("_", " ").title()
    subject = f"New {label} — {inquiry.name or 'unnamed'}"

    lines = [
        f"A new {label} was just submitted on the FloUV website.",
        "",
        f"Name:    {inquiry.name or '—'}",
        f"Company: {inquiry.company or '—'}",
        f"Email:   {inquiry.email or '—'}",
        f"Phone:   {inquiry.phone or '—'}",
        "",
        f"Subject: {inquiry.subject or '—'}",
        "",
        inquiry.message or "(no message)",
        "",
        "—",
        "View and mark this handled in the admin dashboard's Inquiries tab.",
    ]

    recipients = [NOTIFY_TO]
    if extra_to and extra_to != NOTIFY_TO:
        recipients.append(extra_to)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = ", ".join(recipients)
    if inquiry.email:
        # Lets whoever's inbox this lands in just hit Reply to respond
        # directly to the visitor, instead of copy-pasting their address.
        msg["Reply-To"] = inquiry.email
    msg.set_content("\n".join(lines))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
    except Exception as e:
        logger.error(f"Failed to send inquiry notification email: {e}")


def send_report_email(to_email: str, pdf_bytes: bytes, filename: str = "FloUV_Technology_Brief.pdf") -> None:
    """Emails the generated chat report as a PDF attachment to `to_email`.
    Unlike send_inquiry_notification, this DOES raise on failure — sending
    it is the entire point of the request, so the visitor needs to know if
    it didn't go out, rather than getting a silent success."""
    smtp_user = os.getenv("GMAIL_SMTP_USER")
    smtp_password = os.getenv("GMAIL_SMTP_APP_PASSWORD")
    if not smtp_user or not smtp_password:
        raise RuntimeError("Email delivery isn't configured on the server yet.")

    msg = EmailMessage()
    msg["Subject"] = "Your FloUV Technology Brief"
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg.set_content(
        "Thanks for your interest in FloUV — your requested technology brief is attached.\n\n"
        "Have questions after reading it? Just reply to this email."
    )
    msg.add_attachment(pdf_bytes, maintype="application", subtype="pdf", filename=filename)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def send_newsletter_for_new_blog(blog_id: int, blog_title: str) -> None:
    """Emails every newsletter subscriber (signups.source == "newsletter")
    about a newly published blog post. Fired only from blog *creation*
    (never update/delete) as a background task, so it runs after the
    request's own DB session has already closed — opens its own session
    rather than reusing one that's no longer valid. Never raises, same
    reasoning as send_inquiry_notification: a failed batch send must not
    surface as a broken blog-creation response.

    Uses a separate NEWSLETTER_SMTP_USER/NEWSLETTER_SMTP_APP_PASSWORD
    account from the one inquiry notifications use, by design — keeps
    transactional mail and bulk newsletter sends on separate sending
    reputations/limits."""
    smtp_user = os.getenv("NEWSLETTER_SMTP_USER")
    smtp_password = os.getenv("NEWSLETTER_SMTP_APP_PASSWORD")
    if not smtp_user or not smtp_password:
        logger.warning("NEWSLETTER_SMTP_USER/NEWSLETTER_SMTP_APP_PASSWORD not set — skipping newsletter send")
        return

    try:
        from . import models
        from .database import SessionLocal
    except ImportError:
        import models
        from database import SessionLocal

    db = SessionLocal()
    try:
        recipients = [
            row.email
            for row in db.query(models.SignUp).filter(models.SignUp.source == "newsletter").all()
        ]
    finally:
        db.close()

    if not recipients:
        logger.info("No newsletter subscribers to notify for blog %s", blog_id)
        return

    post_url = f"{SITE_BASE_URL.rstrip('/')}/blog/{blog_id}"
    subject = f"New on the FloUV Blog: {blog_title}"
    body = (
        f"We just published a new post on the FloUV blog:\n\n"
        f"{blog_title}\n\n"
        f"Read it here: {post_url}\n\n"
        "—\n"
        "You're receiving this because you signed up for the FloUV newsletter."
    )

    try:
        # One connection, one login, looped sends — not a single message
        # with everyone in To/Bcc, so subscribers never see each other's
        # addresses. Fine at current list sizes; if this list grows into
        # the thousands, Gmail's daily sending caps (~500/day on a regular
        # account) become the limiting factor, not this loop.
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            for recipient in recipients:
                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = smtp_user
                msg["To"] = recipient
                msg.set_content(body)
                server.send_message(msg)
        logger.info("Newsletter sent to %d subscriber(s) for blog %s", len(recipients), blog_id)
    except Exception as e:
        logger.error(f"Failed to send newsletter batch for blog {blog_id}: {e}")
