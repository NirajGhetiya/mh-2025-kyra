# create_tables.py
from .database import db,Base
from .db_models import User, KYC, KYCStatusLog
Base.metadata.create_all(bind=db.engine)
print("Tables created!")