import json
import logging
import os
import time
import uuid

import boto3
dynamodb = boto3.resource('dynamodb')


def create(event, context):
    data = json.loads(event['body'])
    if 'status' not in data or 'outlet' not in data:
        logging.error("Validation Failed")
        raise Exception("Couldn't create the mailbox item.")
    
    timestamp = str(time.time())

    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    item = {
        'id': str(uuid.uuid1()),
        'status': data['status'],
        'outlet': data['outlet'],
        'ip': event['requestContext']['identity']['sourceIp'],
        'createdAt': timestamp
    }

    # write the todo to the database
    table.put_item(Item=item)

    # create a response
    response = {
        "statusCode": 200,
        "headers": {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": True,
        },
        "body": json.dumps(item)
    }

    return response
