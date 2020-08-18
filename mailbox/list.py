import json
import os

from mailbox import decimalencoder
import boto3
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

def list(event, context):
    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    # fetch all mailboxes from the database
    result = table.scan()

    geojson = {
      "type": "FeatureCollection",
      "features": []
    }

    features_timestamps = {}

    for item in result['Items']:
      if item['outlet'] not in features_timestamps or item['createdAt'] > features_timestamps[ item['outlet' ] ]:
        features_timestamps[ item['outlet'] ] = item['createdAt']
      else:
        continue

      feature = {
        "type": "Feature",
        "properties": {
          "status": item['status'],
          "outlet": item['outlet'],
          "createdAt": item['createdAt'],
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

    geojson_string = json.dumps(geojson, cls=decimalencoder.DecimalEncoder)

    s3.put_object(
      Bucket=os.environ['BUCKET'],
      Key='reports.json',
      Body=geojson_string,
      ACL='public-read'
    )

    # create a response
    response = {
        "statusCode": 200,
        "headers": {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": True,
        },
        "body": geojson_string
    }

    return response
