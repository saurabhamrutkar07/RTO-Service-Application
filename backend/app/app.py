import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

import pandas as pd
from io import StringIO
from app.database import SessionLocal, init_db
from app.models import Base, RTOData
#from app.models import RTOData

# Configure logger
logging.basicConfig(
    level=logging.INFO,  # Log level (INFO, ERROR, etc.)
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Logs to console
        logging.FileHandler("app.log")  # Logs to file
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Initialize the database and create tables
init_db()

# Dependency to get the SQLAlchemy session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/upload_rto")
async def upload_rto_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint to upload RTO data from CSV and insert into database.
    :param file: The CSV file containing RTO data.
    :param db: SQLAlchemy session for database interaction.
    :return: A message indicating the result of the upload.
    """
    
    # Check if the file is a CSV
    if not file.filename.endswith(".csv"):
        logger.warning(f"File '{file.filename}' is not a CSV file.")
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    # Read the contents of the file
    contents = await file.read()
    csv_data = StringIO(contents.decode("utf-8"))

    # Try to load the CSV into pandas DataFrame
    try:
        df = pd.read_csv(csv_data)
    except Exception as e:
        logger.error(f"Error reading CSV file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    # Check if necessary columns exist
    if 'RegNo' not in df.columns or 'Place' not in df.columns or 'State' not in df.columns:
        logger.warning("CSV missing required columns: 'RegNo', 'Place', or 'State'.")
        raise HTTPException(status_code=400, detail="CSV must contain 'RegNo', 'Place', and 'State' columns.")

    # Insert data into the database
    upload_status = []
    for _, row in df.iterrows():
        try:
            # Create RTOData entry and add to session
            rto_entry = RTOData(RegNo=row['RegNo'], Place=row['Place'], State=row['State'])
            db.add(rto_entry)
            upload_status.append(f"Success: {row['RegNo']} inserted.")
        except Exception as e:
            upload_status.append(f"Error for {row['RegNo']}: {str(e)}")
            logger.error(f"Error inserting data for {row['RegNo']}: {str(e)}")

    try:
        # Commit the transaction
        db.commit()
        logger.info("All RTO data uploaded successfully.")
        return JSONResponse(content={"message": "RTO data uploaded successfully.", "upload_status": upload_status}, status_code=200)
    except Exception as e:
        db.rollback()
        logger.error(f"Error inserting data into the database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error inserting data into the database: {str(e)}")
