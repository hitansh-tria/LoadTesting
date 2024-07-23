import http from 'k6/http';
import { sleep } from 'k6';
import { getPKPs } from ''

export const options = {
  vus: 1,
//  duration: '5s',
  iterations: 1,
  cloud: {
    // Project: Default project
    projectID: 3701229,
    // Test runs with the same name groups test runs together.
    name: 'Load PoC'
  }
};

// Function to generate a random username
function getRandomUsername() {
    const randomName = (Math.random() + 1).toString(36).substring(2);
    const randomNum = Math.floor(Math.random() * 1000000);
    return `${randomName}${randomNum}`;
}

export default function() {

  const name = getRandomUsername();
  console.log(name)
  let message
  let accToken
  let DIDData
  let jsonResponse

  // Initiate OTP
  message ={"email":`${name}@yopmail.com`,"origin":"https://tria-demo-staging.vercel.app/","fromClientId":"7fc81e4118d1f8f59d48d513a63d561b:f7c89203ddf5487b1e55a00f68188912d66069cb078ab0611f5148c3395d1014fcebec4f1438bc328b2ad1d8b8b332684a668bca6f2786c55b2f4927299b1732833c3b1acaa44ced896abc4d22e4da18e080484519f960a1349ebda84278ae199b7df9117c1e:3dab23f16dad0832f359421744e7f0b0"};

  let response = http.post(
    'https://dev.tria.so/api/v2/auth/initiate-otp', JSON.stringify(message),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log(message)
  console.log(response.json())
  sleep(10)

  //Verify OTP
  message ={"otp":"7R9K3P5A1Q","email":`${name}@yopmail.com`,"fromClientId":"7fc81e4118d1f8f59d48d513a63d561b:f7c89203ddf5487b1e55a00f68188912d66069cb078ab0611f5148c3395d1014fcebec4f1438bc328b2ad1d8b8b332684a668bca6f2786c55b2f4927299b1732833c3b1acaa44ced896abc4d22e4da18e080484519f960a1349ebda84278ae199b7df9117c1e:3dab23f16dad0832f359421744e7f0b0"};

  response = http.post(
    'https://dev.tria.so/api/v2/auth/verify-otp', JSON.stringify(message),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  jsonResponse = JSON.parse(response.body)
  console.log(message)
  console.log(response.json())
  accToken = jsonResponse.accessToken;
  console.log(accToken)
  sleep(10)

  //Check DID
  message ={"did":`${name}@tria`};

  response = http.post(
    'https://dev.tria.so/api/v2/did/check', JSON.stringify(message),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log(message)
  console.log(response.json())
  sleep(10)

  //Name Recommendations
  response = http.get(`https://dev.tria.so/api/v2/get-name-recommendation?name=${name}`);
  console.log(response.json())
  sleep(10)

  //LIT Relayer - Mint and Fetch PKP
    //store DIDData here

  //LIT Sign
    //store EVM Address here (probably)

  //Create DID
//  response = http.post(
//    'https://dev.tria.so/api/v1/did/create', JSON.stringify(DIDData),
//    {
//      headers: {
//        'Content-Type': 'application/json',
//        'Authorisation': `${accessToken}`
//      },
//    }
//  );
//  console.log(response.json())
  //store username and evm address here to a csv
//  sleep(10)

  //Resolve Address to Tria Name

}