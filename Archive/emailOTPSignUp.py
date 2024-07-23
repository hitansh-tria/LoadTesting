import time
import csv
import random as r

from faker import Faker

from locust import SequentialTaskSet, HttpUser, task, constant


def extract_email_name(email):
    return email.split('@')[0]


class emailOTPSignUp(SequentialTaskSet):

    def __init__(self, parent):
        super().__init__(parent)
        self.evmAddress = None
        self.createDIDData = None
        self.accessToken = None
        self.ran = r.randint(0, 999999999)
        self.fake = Faker()
        self.email = f"{self.fake.user_name()}{self.ran}@yopmail.com"
        # self.email = "dekasow358@picdv.com"
        self.email_name = extract_email_name(self.email)

    def write_to_csv(self, tria, evm):
        with open("../LIT/triaName.csv", mode="a", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=["triaName", "evmAddress"])
            writer.writerow({"triaName": tria, "evmAddress": evm})

    @task  # Initiate OTP
    def initiateOTP(self):
        message = {
            "email": self.email,
            "origin": "https://tria-demo-staging.vercel.app/",
            "fromClientId": "eyJjbGllbnRJZCI6ImI0OGQ4MjMwLTU3ZjktNDNmYi1hOTUyLTcyMjY2OGJiMzUyMSIsInByb2plY3RJZCI6ImY1YzlhYTJjLWE5NGUtNDJjNS1hODViLWI5NDNmMDdiOGJjOSJ9"
        }

        response = self.client.post('https://dev.tria.so/api/v2/auth/initiate-otp', json=message)
        print(response, message)
        print(response.json())
        # while True:
        #     time.sleep(1)
        time.sleep(10)

    @task  # Verify OTP
    def verifyOTP(self):
        message = {
            "otp": "7R9K3P5A1Q",  # Static OTP
            "email": self.email,
            "fromClientId": "eyJjbGllbnRJZCI6ImI0OGQ4MjMwLTU3ZjktNDNmYi1hOTUyLTcyMjY2OGJiMzUyMSIsInByb2plY3RJZCI6ImY1YzlhYTJjLWE5NGUtNDJjNS1hODViLWI5NDNmMDdiOGJjOSJ9"
        }

        response = self.client.post('https://dev.tria.so/api/v2/auth/verify-otp', json=message)
        # print(message)
        print(response, message)
        print(response.json())
        response_json = response.json()
        self.accessToken = response_json.get('accessToken')
        # print(self.accessToken)
        time.sleep(10)

    @task  # Check DID
    def checkDID(self):
        message = {
            "did": f"{self.email_name}@tria"
        }

        response = self.client.post('https://dev.tria.so/api/v2/did/check', json=message)
        print(message)
        print(response.json())
        time.sleep(10)

    @task  # Name Recommendations
    def nameReccs(self):
        response = self.client.get(f'https://dev.tria.so/api/v2/get-name-recommendation?name={self.email_name}', name="Name Recommendations")
        print(response)
        time.sleep(10)

    @task  # Get Data for createDID
    def getData(self):
        message = {
            "did": f"{self.email_name}@tria"
        }

        response = self.client.post('https://dev.tria.so/api/v1/did/get-data', json=message)
        print(response)
        response_json = response.json()
        # print(response_json.get('response'))
        self.createDIDData = {
            "fromClientId": "eyJjbGllbnRJZCI6ImI0OGQ4MjMwLTU3ZjktNDNmYi1hOTUyLTcyMjY2OGJiMzUyMSIsInByb2plY3RJZCI6ImY1YzlhYTJjLWE5NGUtNDJjNS1hODViLWI5NDNmMDdiOGJjOSJ9",
            **response_json.get("response")

        }
        self.evmAddress = response_json.get("response").get("evmChainData").get("address")
        print(self.evmAddress)
        self.write_to_csv(self.email_name, self.evmAddress)
        # print(self.createDIDData)
        time.sleep(10)

    @task  # Create DID
    def createDID(self):
        headers = {
            'Authorization': f'Bearer {self.accessToken}'
        }

        response = self.client.post('https://dev.tria.so/api/v1/did/create', json=self.createDIDData, headers=headers)
        print(response.json())
        # time.sleep(30)
        time.sleep(10)

    @task  # Generate SIWE
    def generateSIWE(self):
        response = self.client.get('https://dev.tria.so/api/v2/auth/generate-siwe')
        print(response)
        self.user.stop()
        # sys.exit()
        # print(response.json())
        while True:
            time.sleep(1)

    @task  # Resolve Address to Tria Name (Subgraph 429 Error encountered)
    def resolveAddress(self):
        response = self.client.get(
            f'https://dev.tria.so/api/v2/wallet/resolve-address?address={self.evmAddress}&chainName=SEPOLIA')
        print(response.json())
        while True:
            time.sleep(1)


class LoadTest(HttpUser):
    host = "http://dev.tria.so/api"
    tasks = [emailOTPSignUp]
    wait_time = constant(1)
