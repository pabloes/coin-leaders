## must have
- [ ] Detectar cuando está en red incorrecta, debería cambiar a base mainnet.
- [ ] No usar 0x0000000000000000000000000000000000000000 , ni en la url, usar en todo caso "ETH", porque la gente se confunde
- [ ] Dar NFT con depósito mayor a 2 USD

## good additions
- [ ] Add entry link click counter in small.
- [ ] Set default amount based on price, always a quantity the user can afford, so that deposit button is not disabled.
- [ ] METAVERSES
- [ ] EMBED IN YOU WEB
- [ ] Twitter bot
- [ ] Show a modal when deposit is completed, with all the rewards.
- [ ] in subgraph, on DepositEntity set comm and referrer as User instead of Bytes/Address. 

## other additions
- [ ] Deposits receive a CRH erc20 token. -> we can do an airdrop later with a snapshot from theGraph.
- [ ] Get the USD price from uniswap subgraph so that we don't need a backend using coinmarketcap API https://docs.uniswap.org/sdk/v3/guides/swaps/quoting

## maybe
- [ ] Remove stored data in contract because it's already stored in events.

- [ ]¿ Subscribe your email to receive a referral code?
- [ ] To have a DAO with funds, users can win rewards with viral twitter promotions, form a community behind coin-leaders
- [ ] Maybe Limit characters on title?
- [ ] use MetaEvent: Enforce referrals other way... without showing an address? with a number and graph event?->and URL param to be "r" instead of "referral"
- [ ] Avoid auto-referral when it's the same IP also
- [ ] //TODO let receiverTokenInfo = handlerUserTokenInfoInit(receiver, tokenId);

### completed
- [x] Test contract to successfully deposit tokens or eth and track users data
- [x] deploy subgraph working with sepolia contract
- [x] Look for good domains -> coin-leaders
- [x] Remove leaderboard data from the contract, the update actions to save gas, handle it from theGraph. Because maybe the are small tokens people don't want to pay so much gas for it
- [x] Add support to Eth deposits
- [x] Store leaderboard in contract
- [x] Ensure I can extract ERC20 tokens
- [x] Ensure I can upgrade the contract, test it. ... as I have to change the contract, test it on already deployed one.
- [x] Allow to send directly the ERC20 tokens to specific address.
- [x] do more tokens and deposits so that we can have a variety of them
- [x] in tokenTotals and token leaderboard include token name and symbol ,
- [x] Fix long titles
- [x] Add referrer feature for super marketing!
- [x] On the Home, the 3rd Leaderbosard, only shows 6 entries, and above it, a banner with the Referral stuff
- [x] Create the referral link page where user can connect with wallet as we did before in token page if he does not, and generate the link , adding also some text with instructions
- [x] new token page should work even if leaderboard is empty: WETH 
- [x] Top 3 of tokens must be calculated based on a USD price
- [x] Maybe Add image field, 128x64 or 64x64 (stored on chain, or URL ? we already have url so it's fine to have imageURL like a banner)
- [x] sub-referral , e.g. adding parameter c, so we can look for commercials convencing other influencers commercials.
- [x] Track referral earnings, image, comm on subgraph
- [x] Discord hooks service: it's free. event MetaAction(uint16 key, string value); to add/remove discord hooks using theGraph as a database
- [x] add image url field to token page
- [x] fix: after connecting wallet, screen comes black- [x] fix: try imageUrl to be lorem picsum with random query to avoid repeated images
- [x] add comm parameter to token page when deposit
- [x] Bug: tokenPage when changing account is broken
- [x] full entry space clickable (link)
- [x] Hide referral from URL when already access
- [x] API to generate image of individual leaderboard to use in metaverses with referral links.
- [x] Add comm address on token page deposit
- [x] Add MetaEvent emission to tests
- [x] Avoid yourself as referral
- [x] Create discord server
- [x] Handle http://localhost:5173/token/0x0000000000000000000000000000000000000000 for ETH
- [x] Make the contract pausable
- [x] Add info about $HIGH token and DAO
- [x] Google Analytics
- [x] Change approve with allowance to a big number, not just what we need, somehting more like 99999999 (ask chat GPT)
- [x] Integrar el servicio de escucha de depositos en el server
- [x] Añadir las condiciones del programa de referidos, el 60% será solo para los depósitos antes del 30/09. Posteriormente será reducido y hasta 31/12/2024.
- [x] Que no esté marcado como inseguro por https://www.blockaid.io/
- [x] https://coin-leaders.com/api/screenshot?width=1728&height=968&url=https://coin-leaders?class=screenshot
### canceled
- [NO] (doesnot have fallback, so any deposit will revert) Add functions to extract ETH
- [NO] Protect position for X time
- [NO] add expected position on deposit function , to **require** in case someone else did a deposit faster in middle,