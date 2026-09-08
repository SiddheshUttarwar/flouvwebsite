"""Renders the AI-generated Markdown technology brief (rag/pipeline.py's
handle_report) into a PDF for email delivery, replacing the old
browser-print-to-PDF flow (which only worked if the visitor's browser
actually offered a "save as PDF" print destination)."""
import markdown as md_lib
from fpdf import FPDF, HTMLMixin


class _ReportPDF(FPDF, HTMLMixin):
    pass


# fpdf2's core fonts (Helvetica, etc.) only support Latin-1/WinAnsi — no
# Unicode font is bundled with this project. Gemini's generated report text
# routinely includes typographic characters (em/en dashes, curly quotes,
# ellipses, bullets) that crash rendering outright (FPDFUnicodeEncodingException)
# rather than just looking wrong, so every one of these needs a plain-ASCII
# equivalent before it ever reaches fpdf2.
_UNICODE_TO_ASCII = {
    "—": "--",  # em dash —
    "–": "-",   # en dash –
    "‘": "'", "’": "'",  # curly single quotes ' '
    "“": '"', "”": '"',  # curly double quotes " "
    "…": "...",  # ellipsis …
    "•": "-",   # bullet •
    " ": " ",   # non-breaking space
    "°": " deg",  # degree °
    "µ": "u",   # micro µ
    "×": "x",   # multiplication ×
    "÷": "/",   # division ÷
    "±": "+/-",  # plus-minus ±
}


def _to_pdf_safe_text(text: str) -> str:
    for unicode_char, ascii_equivalent in _UNICODE_TO_ASCII.items():
        text = text.replace(unicode_char, ascii_equivalent)
    # Safety net for anything not explicitly mapped above — replaces rather
    # than raising, so an unusual character (a citation mark, an accented
    # name, a stray symbol) degrades gracefully instead of taking down the
    # whole send.
    return text.encode("latin-1", errors="replace").decode("latin-1")


def markdown_to_pdf_bytes(report_markdown: str, title: str = "FloUV Technology Brief") -> bytes:
    html = md_lib.markdown(_to_pdf_safe_text(report_markdown), extensions=["extra"])

    pdf = _ReportPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    pdf.write_html(f"<h1>{_to_pdf_safe_text(title)}</h1>{html}")
    # fpdf2's output() returns a bytearray; email attachments need bytes.
    return bytes(pdf.output())
