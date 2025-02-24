from sqlalchemy.orm import Session
from app.models import RtoMaster
from app.schemas import RtoMasterResponse

# Fetch RTO_Master records from the database
def get_rto_masters(db: Session, skip: int = 0, limit: int = 10):
    return db.query(RtoMaster).offset(skip).limit(limit).all()