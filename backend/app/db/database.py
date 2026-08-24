import datetime
import os
from typing import Optional, List
from sqlmodel import SQLModel, Field, Session, create_engine, select

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage"))
os.makedirs(DB_DIR, exist_ok=True)

SQLITE_URL = f"sqlite:///{os.path.join(DB_DIR, 'workbench_audit.db')}"
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    action_type: str        # e.g., "SANDBOX_RUN", "DOC_GENERATION", "CHAT_AGENT"
    details: str
    status: str             # "SUCCESS", "FAILED"
    is_airgapped: bool = True

def init_db():
    SQLModel.metadata.create_all(engine)

def log_event(action_type: str, details: str, status: str = "SUCCESS"):
    with Session(engine) as session:
        event = AuditLog(action_type=action_type, details=details, status=status)
        session.add(event)
        session.commit()

def get_recent_audit_logs(limit: int = 50) -> List[AuditLog]:
    with Session(engine) as session:
        return session.exec(select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)).all()