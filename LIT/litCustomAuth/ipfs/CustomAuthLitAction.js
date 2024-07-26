const go = async () => {
    const {accessToken, authMethodType} = authMethod;
    // Authentication
    const url = 'https://dev.tria.so/api/v1/user/info';
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    console.log("data", data);
    if (!data.success) {
        Lit.Actions.setResponse({ response: JSON.stringify({success: false, message: "Authentication Failed" }) });
        return;
    }

    // Authorization
    const authMethodId = `${ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data.userInfo.uuid))}`;
    const tokenId = Lit.Actions.pubkeyToTokenId({ publicKey });
    console.log("tokenId", tokenId);
    const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId })
    console.log("permittedAuthMethods", permittedAuthMethods);
    const permittedAuthMethod = permittedAuthMethods.filter(method => method.id === authMethodId);
    console.log("permittedAuthMethod", permittedAuthMethod);
    if (!permittedAuthMethod.length || permittedAuthMethod[0].auth_method_type !== authMethodType) {
        Lit.Actions.setResponse({ response: JSON.stringify({ success: false, message: "Authorization Failed" }) });
        return;
    };

    // Signing
    let sig;
    switch (TYPE) {
        case 'SIGN_ECDSA':
            sig = await LitActions.signEcdsa({
                toSign: toSign,
                publicKey: publicKey,
                sigName: sigName,
            });
            console.log("sig: ", sig);
            break;
        case 'PERSONAL_SIGN_MESSAGE_ECDSA':
            sig = await LitActions.ethPersonalSignMessageEcdsa({
                message: message,
                publicKey: publicKey,
                sigName: sigName
            });
            console.log("sig: ", sig);
            break;
        default:
            Lit.Actions.setResponse({success: false, response: JSON.stringify({ message: "Method not supported" }) });
            break;
    }
};

go();
