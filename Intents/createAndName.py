import time

from locust import HttpUser, task, constant, TaskSet
import random as r


class createAndName(TaskSet):

    @task # Create Account
    def create(self):

        ph_no = r.randint(100000000, 999999999)

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
                            "from": ph_no,
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

        response = self.client.post('/webhook', json=message)
        print(response)
        while True:
            time.sleep(1)


class LoadTest(HttpUser):
    host = "https://intent.tria.so"
    tasks = [createAndName]
    wait_time = constant(1)

