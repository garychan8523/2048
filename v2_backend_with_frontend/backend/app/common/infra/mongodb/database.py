import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv


load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

motor_client = AsyncIOMotorClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000
)

database = motor_client["default-database"]

default_collection = database["default-collection"]

users_collection = database["users"]

games_collection = database["games"]

