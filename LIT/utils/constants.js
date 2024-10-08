
//import bs58 from 'bs58';
const bs58 = require('bs58');

const getBytesFromMultihash = (multihash) => {
    const decoded = bs58.decode(multihash);
  
    return `0x${Buffer.from(decoded).toString('hex')}`;
  }
  

const CustomAuthMethodTypes = {
    twitter: '0x397380dac5af06d6cba7297392859c4fa4d74528cf67a85b640dfbe6126bee40',
    apple: '0x497380dac5af06d6cba7297392859c4fa4d74528cf67a85b640dfbe6126bee40',
    email: '0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482',
  }
  
  const authMethodTypeToSocialName = {
    '0x397380dac5af06d6cba7297392859c4fa4d74528cf67a85b640dfbe6126bee40': 'twitter',
    '0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482': 'email',
    '0x497380dac5af06d6cba7297392859c4fa4d74528cf67a85b640dfbe6126bee40':'apple'
  }
  
  
  const litStagingSentryDNS = 'https://a27e6fddd92811b8c162d85f250d1386@o4505837187366912.ingest.us.sentry.io/4507107000582144';
  

  
  // for minting the pkp
  const customLAAuthMethod = {
      authMethodType: 2,
      id: getBytesFromMultihash('QmSEFrmdpB8oeGDDa44wjyWzYEUdWPTGBoZBXsgkQZpQjs')
  }
  
  // for interacting with litaction it is acting as a proxy
  const customAuthLAIPFS = 'QmSEFrmdpB8oeGDDa44wjyWzYEUdWPTGBoZBXsgkQZpQjs';
  const customAuthLAIPFSBse64Code = 'Y29uc3QgZ28gPSBhc3luYyAoKSA9PiB7CiAgICBjb25zdCB7YWNjZXNzVG9rZW4sIGF1dGhNZXRob2RUeXBlfSA9IGF1dGhNZXRob2Q7CiAgICAvLyBBdXRoZW50aWNhdGlvbgogICAgY29uc3QgdXJsID0gJ2h0dHBzOi8vYXBpLmRldmVsb3BtZW50LnRyaWEuc28vYXBpL3YxL3VzZXIvaW5mbyc7CiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgewogICAgICAgIG1ldGhvZDogJ0dFVCcsCiAgICAgICAgaGVhZGVyczogewogICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gCiAgICAgICAgfQogICAgfSk7CiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpOwogICAgY29uc29sZS5sb2coImRhdGEiLCBkYXRhKTsKICAgIGlmICghZGF0YS5zdWNjZXNzKSB7CiAgICAgICAgTGl0LkFjdGlvbnMuc2V0UmVzcG9uc2UoeyByZXNwb25zZTogSlNPTi5zdHJpbmdpZnkoe3N1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAiQXV0aGVudGljYXRpb24gRmFpbGVkIiB9KSB9KTsKICAgICAgICByZXR1cm47CiAgICB9CgogICAgLy8gQXV0aG9yaXphdGlvbgogICAgY29uc3QgYXV0aE1ldGhvZElkID0gYCR7ZXRoZXJzLnV0aWxzLmtlY2NhazI1NihldGhlcnMudXRpbHMudG9VdGY4Qnl0ZXMoZGF0YS51c2VySW5mby51dWlkKSl9YDsKICAgIGNvbnNvbGUubG9nKCJDb21wdXRlZCBBdXRoTWV0aG9kSWQiLCBhdXRoTWV0aG9kSWQpOwogICAgY29uc3QgdG9rZW5JZCA9IExpdC5BY3Rpb25zLnB1YmtleVRvVG9rZW5JZCh7IHB1YmxpY0tleSB9KTsKICAgIGNvbnNvbGUubG9nKCJ0b2tlbklkIiwgdG9rZW5JZCk7CiAgICBjb25zdCBwZXJtaXR0ZWRBdXRoTWV0aG9kcyA9IGF3YWl0IExpdC5BY3Rpb25zLmdldFBlcm1pdHRlZEF1dGhNZXRob2RzKHsgdG9rZW5JZCB9KQogICAgY29uc29sZS5sb2coInBlcm1pdHRlZEF1dGhNZXRob2RzIiwgcGVybWl0dGVkQXV0aE1ldGhvZHMpOwogICAgY29uc3QgcGVybWl0dGVkQXV0aE1ldGhvZCA9IHBlcm1pdHRlZEF1dGhNZXRob2RzLmZpbHRlcihtZXRob2QgPT4gbWV0aG9kLmlkID09PSBhdXRoTWV0aG9kSWQpOwogICAgY29uc29sZS5sb2coInBlcm1pdHRlZEF1dGhNZXRob2QiLCBwZXJtaXR0ZWRBdXRoTWV0aG9kKTsKICAgIGlmICghcGVybWl0dGVkQXV0aE1ldGhvZC5sZW5ndGggfHwgcGVybWl0dGVkQXV0aE1ldGhvZFswXS5hdXRoX21ldGhvZF90eXBlICE9PSBhdXRoTWV0aG9kVHlwZSkgewogICAgICAgIExpdC5BY3Rpb25zLnNldFJlc3BvbnNlKHsgcmVzcG9uc2U6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICJBdXRob3JpemF0aW9uIEZhaWxlZCIgfSkgfSk7CiAgICAgICAgcmV0dXJuOwogICAgfTsKICAgIAogICAgLy8gQWZ0ZXIgc3VjY2Vzc2Z1bCBBdXRoZW50aWNhdGlvbiBhbmQgQXV0aG9yaXphdGlvbgogICAgTGl0QWN0aW9ucy5zZXRSZXNwb25zZSh7c3VjY2Vzczp0cnVlLCByZXNwb25zZToidHJ1ZSJ9KTsKfTsKCmdvKCk7Cg=='

module.exports = {CustomAuthMethodTypes, customAuthLAIPFSBse64Code, authMethodTypeToSocialName, litStagingSentryDNS, customLAAuthMethod, customAuthLAIPFS}