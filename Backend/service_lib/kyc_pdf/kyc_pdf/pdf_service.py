import logging
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class DynamicPDF:
 
    def __init__(self, template_dir: str = "/service_lib/kyc_pdf/kyc_pdf/templates", template_name: str = "application_template.html"):
        self.template_dir = template_dir
        self.template_name = template_name
        self.env = Environment(
            loader=FileSystemLoader(self.template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )

    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        try:
            template = self.env.get_template(template_name)
            return template.render(context)
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            raise RuntimeError(f"Error rendering template {template_name}: {e}")

    def generate_pdf_bytes(self, html_content: str) -> bytes:
        try:
            pdf_bytes = HTML(string=html_content).write_pdf()
            return pdf_bytes
        except Exception as e:
            logger.error(f"PDF generation failed: {e}")
            raise RuntimeError(f"Error generating PDF: {e}")

    def generate(self,data) -> bytes:

        html_content = self.render_template(self.template_name, data)

        return self.generate_pdf_bytes(html_content)
