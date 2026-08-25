import csv
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
    action_type: str        # e.g., "SANDBOX_RUN", "DOC_GENERATION", "CHAT_AGENT", "AIRGAP_AUDIT"
    details: str
    status: str             # "SUCCESS", "FAILED"
    is_airgapped: bool = True


def init_db():
    SQLModel.metadata.create_all(engine)


def log_event(action_type: str, details: str, status: str = "SUCCESS", is_airgapped: bool = True):
    with Session(engine) as session:
        event = AuditLog(
            action_type=action_type,
            details=details,
            status=status,
            is_airgapped=is_airgapped
        )
        session.add(event)
        session.commit()


def get_recent_audit_logs(limit: int = 50) -> List[AuditLog]:
    with Session(engine) as session:
        return session.exec(select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)).all()


def export_audit_logs_csv() -> str:
    """Exports all audit events to a compliance CSV file stored locally."""
    csv_file_path = os.path.join(DB_DIR, "workbench_audit_trail_export.csv")
    with Session(engine) as session:
        logs = session.exec(select(AuditLog).order_by(AuditLog.id.asc())).all()

    with open(csv_file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Timestamp (UTC)", "Action Type", "Details", "Status", "Air-Gapped"])
        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp.isoformat(),
                log.action_type,
                log.details,
                log.status,
                "YES" if log.is_airgapped else "NO"
            ])

    return csv_file_path