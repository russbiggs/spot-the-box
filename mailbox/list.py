import json
import os

from mailbox import decimalencoder
import boto3
dynamodb = boto3.resource('dynamodb')


def list(event, context):
    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    # fetch all mailboxes from the database
    result = table.scan()

    geojson = {
      "type": "FeatureCollection",
      "features": []
    }

    for item in result['Items']:
      feature = {
        "type": "Feature",
        "properties": {
          "status": item['status'],
          "outlet": item['outlet'],
          "id": item['id']
        },
        "geometry": {
          "type": "Point",
          "coordinates": [
            item['lng'],
            item['lat']
          ]
        }
      }
      geojson['features'].append(feature)

      
    # create a response
    response = {
        "statusCode": 200,
        "headers": {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": True,
        },
        "body": json.dumps(geojson, cls=decimalencoder.DecimalEncoder)
    }

    return response
