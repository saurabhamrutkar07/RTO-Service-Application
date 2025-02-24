from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL

# Create the database connection
#database = Database(DATABASE_URL)

engine = create_async_engine(DATABASE_URL,echo = True)
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency to get the session
async def get_db():
    async with SessionLocal() as session:
        yield session