import os
from .email_client import EmailClient


class EmailManager:
    def __init__(self, smtp_server=None, smtp_port=None, sender_email=None, sender_password=None):
        self.client = EmailClient(smtp_server, smtp_port, sender_email, sender_password)

    def _load_email_template(self, template_name: str, replacements: dict) -> str:
        """Load the email template from the file and replace placeholders."""
        template_path = os.path.join(os.path.dirname(__file__), 'email_templates', f'{template_name}.html')
        
        try:
            with open(template_path, 'r') as file:
                template = file.read()

            # Replace placeholders with dynamic data
            for placeholder, value in replacements.items():
                template = template.replace(f'{{{{ {placeholder} }}}}', value)

            return template
        except Exception as e:
            raise Exception(f"Failed to load template {template_name}: {e}")

    def send_email_with_template(self, recipient_email: str, subject: str, body: str):
        """Send email using a loaded template."""
        try:
            self.client.send_email(recipient_email, subject, body)
        except Exception as e:
            raise Exception(f"Failed to send email: {e}")

    def send_welcome_email(self, recipient_email: str, user_name: str, kyc_id: str, base_url: str):
        """Send Welcome email with dynamic KYC link."""
        subject = "Welcome to Kyra Agentic KYC Journey"
        
        # Prepare dynamic content for the template
        replacements = {
            'user_name': user_name,
            'kyc_id': str(kyc_id),
            'link': f"{base_url}/{kyc_id}"
        }

        # Load the email template and send the email
        body = self._load_email_template('welcome_email', replacements)
        self.send_email_with_template(recipient_email, subject, body)
        
    def send_rekyc_email(self, recipient_email: str, user_name: str, kyc_id: str, base_url: str):
        """Send Welcome email with dynamic KYC link."""
        subject = "Re-KYC Request from Kyra"
        if user_name is None:
            user_name = "User"
        # Prepare dynamic content for the template
        replacements = {
            'user_name': str(user_name),
            'kyc_id': str(kyc_id),
            'link': f"{base_url}/{kyc_id}"
        }

        # Load the email template and send the email
        body = self._load_email_template('rekyc_email', replacements)
        self.send_email_with_template(recipient_email, subject, body)

    def send_congrats_email(self, recipient_email: str, user_name: str, kyc_id: str):
        """Send Welcome email with dynamic KYC link."""
        subject = "Congrats! KYC is Sucessful"
        if user_name is None:
            user_name = "User"
        # Prepare dynamic content for the template
        replacements = {
            'user_name': str(user_name),
            'kyc_id': str(kyc_id),
        }

        # Load the email template and send the email
        body = self._load_email_template('congrats_email', replacements)
        self.send_email_with_template(recipient_email, subject, body)
        
    def send_generic_email(self, recipient_email: str, subject: str, body: str):
        """A generic email-sending function that can be used for any email."""
        self.send_email_with_template(recipient_email, subject, body)
