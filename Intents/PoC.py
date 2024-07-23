from locust import HttpUser, task, constant
import random


class LoadTest(HttpUser):
    host = "https://intent.tria.so"
    wait_time = constant(1)

    @task  # Trigger bot
    def trigger(self):
        pnum = random.random()
        # headers = {
        #     'user-agent': 'facebookexternalua',
        #     'content-length': '550',
        #     'accept': '*/*',
        #     'accept-encoding': 'deflate, gzip',
        #     'content-type': 'application/json',
        #     'x-forwarded-for': '2a03:2880:10ff:a::face:b00c',
        #     'x-forwarded-host': 'probably-many-sloth.ngrok-free.app',
        #     'x-forwarded-proto': 'https',
        #     'x-hub-signature': 'sha1=9466decd7419933a8cebb58f047e54009095027d',
        #     'x-hub-signature-256': 'sha256=ba56c0ce9de305f58b197712efc1ff55f2a73deb57d69d2923c07ee19d538be1'
        # }
        message = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE_NUMBER",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "contacts": [{
                            "profile": {
                                "name": "NAME"
                            },
                            "wa_id": "PHONE_NUMBER"
                        }],
                        "messages": [{
                            "from": pnum,
                            "id": "wamid.ID",
                            "timestamp": "TIMESTAMP",
                            "text": {
                                "body": "create account"
                            },
                            "type": "text"
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }

        # response = self.client.post('/webhook', json=json.dumps(message), headers=headers)
        response = self.client.post('/webhook', json=message)
        print(response)
        # self.client.post(data=json.dumps(message))
        # response = self.client.get('/webhook?hub.mode=subscribe&hub.verify_token=abc&hub.challenge=hello')
        # print(response.status_code)
