"""Renders the AI-generated Markdown technology brief (rag/pipeline.py's
handle_report) into a PDF for email delivery, replacing the old
browser-print-to-PDF flow (which only worked if the visitor's browser
actually offered a "save as PDF" print destination)."""
import markdown as md_lib
from fpdf import FPDF, HTMLMixin


class _ReportPDF(FPDF, HTMLMixin):
    pass


def markdown_to_pdf_bytes(report_markdown: str, title: str = "FloUV Technology Brief") -> bytes:
    html = md_lib.markdown(report_markdown, extensions=["extra"])

    pdf = _ReportPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    pdf.write_html(f"<h1>{title}</h1>{html}")
    # fpdf2's output() returns a bytearray; email attachments need bytes.
    return bytes(pdf.output())
