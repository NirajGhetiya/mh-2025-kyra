import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

class EmailClient:
    def __init__(self, smtp_server=None, smtp_port=None, sender_email=None, sender_password=None):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port 
        self.sender_email = sender_email 
        self.sender_password = sender_password 

    def send_email(self, recipient_email: str, subject: str, body: str):
        """Sends an HTML email."""
        try:
            msg = MIMEMultipart()
            msg["From"] = formataddr(("Kyra", self.sender_email))
            msg["To"] = recipient_email
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
        except Exception as e:
            raise Exception(f"Failed to send email: {e}")
