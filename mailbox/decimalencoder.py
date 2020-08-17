import decimal
import json


# This is a workaround for: http://bugs.python.org/issue16535
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            if obj == int(obj):
              return int(obj)
            else:
              return float(obj)
        return super(DecimalEncoder, self).default(obj)
