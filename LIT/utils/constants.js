
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
      id: getBytesFromMultihash('QmZy214gmBq6t4D76DwXasfwpP3H1rARLq25BiG1MynbyT')
  }
  
  // for interacting with litaction it is acting as a proxy
  const customAuthLAIPFS = 'QmZy214gmBq6t4D76DwXasfwpP3H1rARLq25BiG1MynbyT';

module.exports = {CustomAuthMethodTypes, authMethodTypeToSocialName, litStagingSentryDNS, customLAAuthMethod, customAuthLAIPFS}