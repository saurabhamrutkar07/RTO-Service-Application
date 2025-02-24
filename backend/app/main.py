"""Using normal Python """

# import psycopg2

# host = "localhost"
# database = 'rtodatabase'
# user = 'postgres'
# password = 'admin123'

# connection = None
# try:
#     connection = psycopg2.connect(
#         host = host,
#         database = database,
#         user = user, 
#         password = password
#     )
#     with connection.cursor() as cursor:
#         #cursor.execute("SELECT version();")
#         cursor.execute('SELECT * FROM public."RTO_Master" WHERE "RTOCode" = "MH19";')
#         result = cursor.fetchall()
#         print(f" connected to postgres sql result is {result}")
# except Exception as e:
#     print(f"Error {e}")
    
# finally:
#     if connection:
#         connection.close()
#         print("connection close")
        
    
    
    
    
# app.py
from dotenv import load_dotenv
import os
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.future import select
from pydantic import BaseModel, ValidationError, constr, Field, field_validator
import re 
import logging
import random 
import string
# from sqlalchemy.pool import NullPool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))


DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

print(f"{DB_HOST},{DB_NAME},{DB_USER},{DB_PASSWORD}")

app = FastAPI()
print('Fastapi initialize')
# CORS Configuration
allowedOrigins = ["*"]  # Allow all origins or use specific URLs like ["https://example.com"]
allowedCredentials = True
allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]  # Specify allowed HTTP methods
allowedHeaders = ["X-Custom-Header", "Content-Type", "Authorization"]  # Allowed headers

# Add CORSMiddleware to handle CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowedOrigins,  # Allow specific origins
    allow_credentials=allowedCredentials,  # Allow credentials (cookies, headers)
    allow_methods=allowedMethods,  # Allow specific HTTP methods
    allow_headers=allowedHeaders,  # Allow specific headers
)


# SQLAlchemy setup
# DATABASE_URL = "postgresql+psycopg2://postgres:admin123@localhost/rtodatabase"
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
print(DATABASE_URL)
# Create the SQLAlchemy base class for models
Base = declarative_base()

# Create a database engine
engine = create_engine(DATABASE_URL, echo=True)

# Create the SessionLocal class that will handle DB sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Set up logging
logger = logging.getLogger(__name__)
# Define your table model
class RtoMaster(Base):
    __tablename__ = 'RTO_Master'

    RTOCode = Column(String, primary_key=True)
    Place = Column(String, index=True)
    State = Column(String, index=True)


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RtoCodeQueryParams(BaseModel):
    #rto_code: constr(regex=r'^[A-Za-z]{2}\d{2}$')  # Match exactly two letters followed by two digits
    #rto_code: str = Field(..., pattern=r'^[A-Za-z]{2}\d{2}$',error_messages={'regex': 'RTO code must follow the format: two letters followed by two digits (e.g., MH19).'})
    rto_code: str = Field(min_length=4,max_length=4)
    #state : str = Field(min_length=1, max_length=50)
    print(f"This is rto code {rto_code}")
    #Use a custom validator to validate the pattern and modify the error message
    @field_validator('rto_code')
    def validate_rto_code(cls, v):
        if not re.match(r'^[A-Za-z]{2}\d{2}$', v):
            raise ValueError("RTO code must follow the format: two letters followed by two digits (e.g., 'MH19').")
        return v
    # @field_validator('state')
    # def validate_state(cls,v):
    #     if not re.match(r'^[A-Za-z\s]+$',v):
    #         raise ValueError("Invlaid State. State name shold only contains alphabates")
    #     return v 
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    # This is the custom error handler for Pydantic validation errors
    # Modify the response here to exclude input_value, input_type, etc.
    error_messages = []
    for error in exc.errors():
        error_msg = error.get("msg", "Unknown error")
        error_messages.append({"msg": error_msg, "type": error.get("type", "value_error")})

    return JSONResponse(
        status_code=422,
        content={"detail": error_messages},
    )

# FastAPI route to fetch data from the database

@app.get("/api/rto/")
async def get_details_by_rto_code(query_params: RtoCodeQueryParams = Depends(), db: Session = Depends(get_db)):
    """
    Accepts The rto code as query parameter and retuerns the place(district) and State 
    """
    rto_code = query_params.rto_code
    # Build the query with optional filters
    query = db.query(RtoMaster)
    print(f"This is query {query}")
    if not rto_code:
        raise HTTPException(status_code=404, detail="Please provide valid rto code")
    try:
    
        
            query = query.filter(RtoMaster.RTOCode == rto_code)
            rto_data = query.all()
            if rto_data:
                return {"data": rto_data}
            else:
                # If no data is found, raise an HTTPException with a custom error message
                raise HTTPException(status_code=404, detail="No matching RTO data found")
    
    except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    


@app.get("/api/states")
async def get_states(db: Session = Depends(get_db)):
    """
        Fetches the list of distinct states from the table  
    """
    try :
        states = db.query(RtoMaster.State).distinct().all()
        db.commit()
        print(states)
        if states:
            return [{state[0].upper():state[0]} for state in states]
        else:
            raise HTTPException(status_code=404,detail="No Data found")
    except Exception as e:
        raise Exception(status_code=500,detail=f"Internal Server Error:{str(e)}")
    finally:
        db.close()
    
@app.get("/api/state-districts/{state}")
async def get_district_by_state(state: str, db: Session = Depends(get_db)):
    if not re.match(r'^[A-Za-z\s]+$', state):
        raise HTTPException(status_code=400, detail="Invalid state. State name should only contain alphabets and spaces.")
    
    print(f"State received: {state}")
    unique_districts = db.query(RtoMaster).filter(RtoMaster.State == state).all()
    
    if not unique_districts:
        raise HTTPException(status_code=404, detail="No data found") 
    try:         
        result = [{"State":district.State, "Place":district.Place,"RTOCode":district.RTOCode} for district in unique_districts] 
        return result
    
    except Exception as e :
        logger.error(f"Error occurred while processing the state {state}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error:{str(e)}")
    
@app.get("/api/alphabate-options")
async def get_alphabates_options():
    """
    Generate Alphabates options from A to ZZ
    """
    try : 
        
        alphabates = []
        for letter in string.ascii_uppercase:
            alphabates.append(letter)
        
        for first_letter in string.ascii_uppercase:
            for second_letter in string.ascii_uppercase:
                alphabates.append(first_letter + second_letter)
        return alphabates
    
    except Exception as e :
        logger.error(f"Error generating alphabet options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error : {str(e)}")
    

@app.get("/api/generate_rto_code/{state}/{district}/{alphabate}")
async def generate_rto_code(state:str, district:str,alphabate:str, db: Session= Depends(get_db)):
    """
    Generates a random RTO code based on the selected state, district (RTO code), and alphabet.
    """
    
    if not re.match(r'[A-Z]{1,2}$',alphabate):
        raise HTTPException(status_code=400, detail="Invalid alphabet. Must be a single or double letter (e.g., A, AA, AB, etc.).")
    
    rto_entry = db.query(RtoMaster).filter(RtoMaster.State == state, RtoMaster.Place == district).first()
    
    if not rto_entry:
        raise HTTPException(status_code=404, detail=f"{state} and {district} comnination not found")
    
    random_4_digit_code = random.randint(1000,9999)
    
    rto_code = f"{rto_entry.RTOCode}{alphabate}{random_4_digit_code}"
    return rto_code    

    
    