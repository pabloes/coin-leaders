export const getRegisteredReferrals = async() => {
    return [
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000"
    ]
}

export const getRegisteredComm = async(num) => {
    const registeredComms = [
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x62C05caA528EED7F57f6f4857e8E4DF4b0BFF434",
        "0x5985EB4a8e0e1f7BCa9Cc0D7AE81C2943fb205bd",
        "0x729be2EB86aE64bD7158A9B428f5FE3253F36b0b"
    ];

    if(isNaN( Number(num))) return undefined;
    return registeredComms[Number(num)];
}