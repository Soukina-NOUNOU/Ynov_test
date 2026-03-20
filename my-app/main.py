import mysql.connector
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Create a connection to the database
conn = mysql.connector.connect(
    database=os.getenv("MYSQL_DATABASE"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    port=3306,
    host=os.getenv("MYSQL_HOST"))

@app.get("/users")
async def get_users():
    cursor = conn.cursor()
    sql_select_Query = "SELECT * FROM utilisateur"
    cursor.execute(sql_select_Query)
    # get all records
    records = cursor.fetchall()
    print("Total number of rows in table: ", cursor.rowcount)
    # renvoyer nos données et 200 code OK
    return {'utilisateurs': records}


class UserData(BaseModel):
    firstName: str
    lastName: str
    email: str
    birth: str
    city: str
    postalCode: str


class UserCreate(BaseModel):
    userData: UserData
    metadata: Optional[dict] = None


@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO utilisateur (firstName, lastName, email, birth, city, postalCode) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (
            user.userData.firstName,
            user.userData.lastName,
            user.userData.email,
            user.userData.birth,
            user.userData.city,
            user.userData.postalCode,
        )
        cursor.execute(sql, values)
        conn.commit()
        new_id = cursor.lastrowid
        return {
            "id": new_id,
            "firstName": user.userData.firstName,
            "lastName": user.userData.lastName,
            "email": user.userData.email,
            "birth": user.userData.birth,
            "city": user.userData.city,
            "postalCode": user.userData.postalCode,
        }
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")


@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM utilisateur WHERE id = %s", (user_id,))
    conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

