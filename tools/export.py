import csv

from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.fuusio70
users = db.users.find()
with open('users.csv', 'w') as csvfile:
    fieldnames = users[0].keys()
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for user in users:
        writer.writerow(user)
