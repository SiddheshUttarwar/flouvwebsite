"""Records every email address collected anywhere on the site into the
signups table — see models.SignUp for why this is separate from the fuller
Inquiry record."""
try:
    from . import models
except ImportError:
    import models


def record_signup(db, email: str | None, source: str) -> None:
    if not email:
        return
    db.add(models.SignUp(email=email, source=source))
    db.commit()
