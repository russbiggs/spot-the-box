import json
import logging
import os
import time
import uuid
import decimal
from mailbox import decimalencoder

import boto3
dynamodb = boto3.resource('dynamodb')
#s3 = boto3.resource('s3')

def create(event, context):
    data = json.loads(event['body'])
    if 'status' not in data or 'outlet' not in data or 'lat' not in data or 'lng' not in data:
        logging.error("Validation Failed")
        raise Exception("Couldn't create the mailbox item.")
    
    timestamp = str(time.time())

    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    item = {
        'id': str(uuid.uuid1()),
        'status': data['status'],
        'outlet': data['outlet'],
        'lat': decimal.Decimal(str(data['lat'])),
        'lng': decimal.Decimal(str(data['lng'])),
        'ip': event['requestContext']['identity']['sourceIp'],
        'createdAt': timestamp
    }

    # write the todo to the database
    table.put_item(Item=item)

    # signedUrl = s3.generate_presigned_url('get_object', Params={'Bucket': os.environ['BUCKET'], 'Key': 'images/' + item['id']})

    # create a response
    response = {
        "statusCode": 200,
        "headers": {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": True,
        },
        "body": json.dumps(item, cls=decimalencoder.DecimalEncoder)
    }

    return response
