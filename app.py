# -*- coding=utf-8 -*-


# ======================================
# >>> IMPORTS
# ======================================

# Python
import json
import threading

# import json_util
from bson import ObjectId
from time import time

# Third-party
from flask import Flask, request, Blueprint, render_template
from flask_mail import Mail
from flask_cors import CORS, cross_origin


from pymongo import MongoClient

# Project
import utils
# from server import utils

# ======================================
# >>> INITIALIZE
# ======================================

app = Flask(__name__, static_url_path='')
CORS(app)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
routes = Blueprint('ilmo', __name__, url_prefix='/api')


# ======================================
# >>> VIEWS
# ======================================

@app.route('/', methods=['GET'])
@cross_origin(origins='*')
def homepage():
    return render_template('index.html')


@app.route('/registration', methods=['GET'])
@cross_origin(origins='*')
def registration():
    return render_template('registration.html')

# ======================================
# >>> REST API ENDPOINTS
# ======================================


@routes.route('/users', methods=['GET'])
@cross_origin(origins='*')
def users_read():
    """ Returns all user objects """
    db = get_database()
    users = db.users.find()
    sanitized_users = [
        {
            'name': u.get('name', ''),
            'table': u.get('table', ''),
            'timestamp': u.get('timestamp'),
            'preRegistration': u.get('preRegistration'),
            'guildStatus': u.get('guildStatus', '')
        } for u in users
    ]
    return JSONEncoder().encode(sanitized_users)


@routes.route('/users/<user_id>', methods=['GET'])
@cross_origin(origins='*')
def user_read(user_id):
    """ Returns single user object by id """
    db = get_database()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    sanitized_user = {}
    if user:
        sanitized_user = {
            'timestamp': user.get('timestamp')
        }
    return JSONEncoder().encode(sanitized_user)


@routes.route('/usersCount', methods=['GET'])
@cross_origin(origins='*')
def users_count():
    """ Returns the count of user objects """
    db = get_database()
    count = db.users.count()
    return JSONEncoder().encode(count)


@routes.route('/users', methods=['PUT'])
@cross_origin(origins='*')
def users_update():
    """ Update user object """
    db = get_database()

    settings = db.config.find_one()
    debug = int(settings['App']['Debug'])

    if (debug != 1):
        timestamp = int(time())
        # Registration opens at
        # 11/21/2016 @ 10:00am (UTC) [1479722400]
        if timestamp < 1485770400:
            return 'Registration has not opened yet'

    raw_data = request.data
    print(str(raw_data.decode("utf-8")))
    try:
        if not raw_data:
            raise ValueError('request.data was empty')
        data = json.loads(str(raw_data.decode("utf-8")))
    except ValueError as e:
        print('[ERROR] /users PUT ValueError: ' + str(e))
        return str(e)

    user = data.get('formData')
    user_id = data.get('userId')

    old_user = db.users.find_one({'_id': ObjectId(user_id)})
    if old_user.get('name') or user.get('name', '') == '':
        # The user has been registered already or there was
        # no name given to this user, abort!
        return json.dumps({'userId': str(user_id)})

    timestamp = old_user.get('timestamp')
    user = validate_user(user, timestamp)

    user['referenceNumber'] = utils.get_reference_number(db)
    db.users.update({'_id': ObjectId(user_id)}, {'$set': user}, upsert=True)

    sent_successfully = utils.send_billing_mail(mail, settings, user)
    db.users.update(
        {'_id': ObjectId(user_id)},
        {'$set': {'emailSent': sent_successfully}}
    )

    return json.dumps({'userId': str(user_id)})


@routes.route('/users', methods=['POST'])
@cross_origin(origins='*')
def users_create():
    """ Creates new empty user object """
    db = get_database()
    timestamp = int(time())

    settings = db.config.find_one()
    debug = int(settings['App']['Debug'])

    if (debug != 1):
        # Registration opens at
        # 11/21/2016 @ 10:00am (UTC) [1479722400]
        if timestamp < 1485770400:
            return json.dumps({'userId': '', 'timestamp': timestamp})

    users = db.users
    users_list = list(users.find())

    max_users = int(settings['App']['MaxUsers'])
    priority_users = [
        u for u in users_list if u.get('preRegistration', False) is True
        or u.get('guildStatus', '') == 'currentMember'
    ]
    if len(priority_users) >= max_users:
        # TODO: return error
        print('[WARNING] Max number of users have registered')
        return json.dumps({'userId': '', 'timestamp': timestamp})

    dummy_user = {
        'additionalInfo': '',
        'allergies': '',
        'avec': '',
        'email': '',
        'firstYear': '',
        'historyAddress': '',
        'historyDeliveryMethod': '',
        'historyOrder': '',
        'name': '',
        'referenceNumber': '',
        'sillis': '',
        'status': '',
        'table': '',
        'greeting': '',
        'represent': '',
        'drinkMenu': '',
        'guildStatus': '',
        'preRegistration': False,
        'timestamp': timestamp
    }
    user_id = users.insert_one(dummy_user).inserted_id

    # Timeout, delete if not edited within timeout limit
    settings = db.config.find_one()
    timeout_duration = int(settings['App']['SessionTimeout'])
    threading.Timer(
        timeout_duration, session_timeout, (db, str(user_id))
    ).start()

    return json.dumps({'userId': str(user_id), 'timestamp': timestamp})


# ======================================
# >>> HELPERS
# ======================================

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


def validate_user(user, timestamp):
    # HACK updating roles at 30.1.2017 12pm (gmt+2)
    valid_statuses = ['inviteGuest']
    default_status = 'inviteGuest'
    preregistration = True
    if timestamp >= 1485770400:
        valid_statuses = ['student', 'notStudent', 'supporter']
        default_status = 'notStudent'
        preregistration = False

    validated_user = {
        'additionalInfo': user.get('additionalInfo', ''),
        'allergies': user.get('allergies', ''),
        'avec': user.get('avec', ''),
        'email': user.get('email', ''),
        'firstYear': user.get('firstYear', ''),
        'historyAddress': user.get('historyAddress', ''),
        'name': user.get('name', ''),
        'represent': user.get('represent', ''),
        'table': user.get('table', ''),
        'greeting': (
            user.get('greeting') if user.get('greeting')
            in ['true', 'false'] else 'false'),
        'historyOrder': (
            user.get('historyOrder') if user.get('historyOrder')
            in ['true', 'false'] else 'false'),
        'sillis': (
            user.get('sillis') if user.get('sillis')
            in ['true', 'false'] else 'false'),
        'status': (
            user.get('status') if user.get('status')
            in valid_statuses
            else default_status),
        'historyDeliveryMethod': (
            user.get('historyDeliveryMethod')
            if user.get('historyDeliveryMethod')
            in ['pickup', 'deliverPost'] else 'pickup'),
        'timestamp': timestamp,
        'guildStatus': (
            user.get('guildStatus') if user.get('guildStatus')
            in ['currentMember', 'exMember', 'other']
            else 'other'),
        'drinkMenu': (
            user.get('drinkMenu') if user.get('drinkMenu')
            in ['alcoholic', 'nonAlcoholic', 'onlyWines']
            else 'N/A'),
        'preRegistration': preregistration
    }
    return validated_user


def session_timeout(mongo_db, user_id):
    user = mongo_db.users.find_one({'_id': ObjectId(user_id)})
    if not user.get('name'):
        mongo_db.users.delete_one({'_id': ObjectId(user_id)})


def get_database():
    client = MongoClient('localhost', 27017)
    return client.fuusio70

# ======================================
# >>> RUN
# ======================================

settings = utils.load_config(
    app,
    get_database(),
    # '/home/fuusio70-ilmo/server/config.ini'
    '/home/einari/Documents/Dev/fuusio71-ilmo/config.ini'
)
mail = Mail(app)

app.register_blueprint(routes)
application = app

application.run()