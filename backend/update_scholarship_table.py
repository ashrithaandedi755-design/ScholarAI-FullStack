import sqlite3


connection = sqlite3.connect("data/scholarai.db")
cursor = connection.cursor()

cursor.execute(
    "ALTER TABLE scholarships ADD COLUMN min_income FLOAT"
)

cursor.execute(
    "ALTER TABLE scholarships ADD COLUMN max_income FLOAT"
)

cursor.execute(
    "ALTER TABLE scholarships ADD COLUMN required_state VARCHAR"
)

cursor.execute(
    "ALTER TABLE scholarships ADD COLUMN required_category VARCHAR"
)

cursor.execute(
    "ALTER TABLE scholarships ADD COLUMN required_education VARCHAR"
)

connection.commit()
connection.close()

print("Scholarship table updated successfully")