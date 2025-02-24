from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class RtoMaster(Base):
    __tablename__ = 'RTO_Master'
    
    # Columns
    RTOCode = Column(String, primary_key=True, index=True)
    Place = Column(String)
    State = Column(String)
