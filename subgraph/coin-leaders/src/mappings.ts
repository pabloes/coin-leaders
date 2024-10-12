import {BigInt, Address, ethereum, log, Bytes} from "@graphprotocol/graph-ts";
import {
  Deposit,
  Deposit as DepositEvent,
  DepositInfo as DepositInfoEvent,
  ReceiverChanged as ReceiverChangedEvent,
  ReferrerQuoteChanged as ReferrerQuoteChangedEvent,
  CommQuoteChanged as CommQuoteChangedEvent,
  MetaEvent, CommQuoteChanged, DepositInfo,
} from "../generated/MultiTokenHighscore/MultiTokenHighscore";
import {Transfer} from  "../generated/MultiTokenHighscore/ERC20";
import {
  TokenLeaderboard,
  TokenTotal,
  User,
  UserTokenInfo, DepositEntity,
  Config
} from "../generated/schema";
import { ERC20 } from './contracts/ERC20';
import { MetaEventEntity } from "../generated/schema";

function handleDepositCommon(
    _block:ethereum.Block, _transaction:ethereum.Transaction, _logIndex:BigInt,
    _token:Address,
    _user:Address, _amount:BigInt,
    _referrer:Address, _comm:Address,
    _referrerPercentage:i32, _commPercentage:i32,
    _receiver:Address, event:DepositEvent
):void{
  let tokenTotal = TokenTotal.load(_token.toHex());
  log.info("--->START MAPPING", []);
  const tokenId = _token.toHex();
  const userInstance:User = initUser(_user.toHex());
  userInstance.save();
  const receiver:User =  initUser(_receiver.toHex());
  receiver.save();
  if (tokenTotal == null) {
    tokenTotal = new TokenTotal(tokenId);
    tokenTotal.tokenAddress = Address.fromString(tokenId);
    tokenTotal.totalDeposited = BigInt.fromI32(0);
    if(_token == Address.zero()){
      tokenTotal.name = "Ethereum";
      tokenTotal.symbol = "ETH";
      tokenTotal.decimals = 18;
    }else{
      let tokenContract = ERC20.bind(Address.fromString(tokenId));
      let nameResult = tokenContract.try_name();
      let symbolResult = tokenContract.try_symbol();
      let decimalsResult = tokenContract.try_decimals();
      tokenTotal.name = nameResult.reverted ? "_Unknown_" : nameResult.value;
      tokenTotal.symbol = symbolResult.reverted ? "_UNK_" : symbolResult.value;
      tokenTotal.decimals = decimalsResult.reverted ? 0 : decimalsResult.value;
    }

    tokenTotal.referralEarnings = BigInt.fromI32(0);
    tokenTotal.commEarnings = BigInt.fromI32(0);
    tokenTotal.receiverEarnings = BigInt.fromI32(0);
  }

  log.info("depositerTokenInfo = handlerUserTokenInfoInit", [])
  let depositerTokenInfo = handlerUserTokenInfoInit(_user.toHex(), tokenId)
  depositerTokenInfo.totalDeposited = depositerTokenInfo.totalDeposited.plus(_amount);
  depositerTokenInfo.save();

  let referrerAmount = BigInt.fromI32(0);
  let commAmount = BigInt.fromI32(0);
  let receiverAmount = _amount;
  // Use the transfer event logs to determine the actual amounts transferred
  let depositId = _transaction.hash.toHex() + "-" + _logIndex.toString();
  let depositEntity = initDeposit(event.params.token, event.transaction, event.params.user);

  depositEntity.userTokenInfo = depositerTokenInfo.id;
  depositEntity.user = _user.toHex();
  depositEntity.token = tokenTotal.id;
  depositEntity.amount = _amount;
  depositEntity.transaction = _transaction.hash.toHex();
  depositEntity.receiver = receiver.id;
  depositEntity.referrerPercentage = _referrerPercentage;
  depositEntity.commPercentage = _commPercentage;

  if(_referrer != Address.zero()){
    log.info("-->referrer not zero {}", [_referrer.toHex()]);
    let referrerUser = initUser(_referrer.toHex());
    referrerUser.save();
    depositEntity.referrer = _referrer.toHex();

    referrerAmount = _amount.times(BigInt.fromU32(_referrerPercentage)).div(BigInt.fromI32(100))
    receiverAmount = receiverAmount.minus(referrerAmount);
    log.info("referrerTokenInfo = handlerUserTokenInfoInit {}", [_referrer.toHex()])
    let referrerTokenInfo = handlerUserTokenInfoInit(_referrer.toHex(), tokenId);

    referrerTokenInfo.referralEarnings = referrerTokenInfo.referralEarnings.plus(referrerAmount);
    referrerTokenInfo.totalEarnings = referrerTokenInfo.totalEarnings.plus(referrerAmount);
    referrerTokenInfo.save();
  }
  if(_comm != Address.zero()){
    log.info("-->comm not zero {}", [_comm.toHex()]);
    let commUser = initUser(_comm.toHex());
    commUser.save();
    depositEntity.comm = _comm.toHex();

    commAmount = _amount.times(BigInt.fromU32(_commPercentage)).div(BigInt.fromI32(100))
    receiverAmount = receiverAmount.minus(commAmount);
    log.info("commTokenInfo = handlerUserTokenInfoInit {}", [_comm.toHex()])
    let commTokenInfo = handlerUserTokenInfoInit(_comm.toHex(), tokenId);

    commTokenInfo.referralEarnings = commTokenInfo.referralEarnings.plus(commAmount);
    commTokenInfo.totalEarnings = commTokenInfo.totalEarnings.plus(commAmount);
    commTokenInfo.save();
  }
  log.info("receiverTokenInfo = handlerUserTokenInfoInit", []);

  let receiverTokenInfo = handlerUserTokenInfoInit(receiver.id, tokenId);
  receiverTokenInfo.totalEarnings = receiverTokenInfo.totalEarnings.plus(receiverAmount);


  tokenTotal.totalDeposited = tokenTotal.totalDeposited.plus(_amount);

  tokenTotal.receiverEarnings = tokenTotal.receiverEarnings.plus(receiverAmount);
  tokenTotal.referralEarnings = tokenTotal.referralEarnings.plus(referrerAmount);
  tokenTotal.commEarnings = tokenTotal.commEarnings.plus(commAmount);




  let leaderboard = initTokenLeaderboard(_token,_user)
  leaderboard.depositedAmount = leaderboard.depositedAmount.plus(_amount);
  leaderboard.save();
  depositEntity.save();
  tokenTotal.save();
  depositerTokenInfo.save();
  receiverTokenInfo.save();
  log.info("FINISHED processing deposit event for user: {}, token: {}, amount: {}", [
    _user.toHex(),
    tokenId,
    _amount.toString()
  ]);

}
// Handle ERC20 token deposits
export function handleDeposit(event: DepositEvent): void {
  let tokenId = event.params.token.toHex();
  const config = Config.load("config");

  const referrerPercentage = config ? config.referrerPercentage : 60;
  const commPercentage = config ? config.commPercentage : 10;
  const receiver:Address = config ? Address.fromString(config.receiver as string) : Address.fromString("0xE5Af96fF2eA93a3fFE474f13A0a2196306763d09");
  const receiverUser = initUser(receiver.toHex())
  handleDepositCommon(
      event.block, event.transaction, event.logIndex,
      event.params.token,
      event.params.user, event.params.amount,
      event.params.referrer, event.params.comm,
      //TODO -> event to set this data in theGraph before any other
      referrerPercentage, commPercentage,
      Address.fromBytes(receiver) ,
      event
  );
}

function initTokenLeaderboard(tokenAddress:Address, userAddress:Address):TokenLeaderboard{
  const leaderboardId = tokenAddress.toHex() + "-" + userAddress.toHex()
  let tokenLeaderboard = TokenLeaderboard.load(leaderboardId)
  if(tokenLeaderboard === null){
    tokenLeaderboard = new TokenLeaderboard(leaderboardId);
    tokenLeaderboard.token = tokenAddress.toHex();
    tokenLeaderboard.depositedAmount = BigInt.zero(); // Initialize to zero
    tokenLeaderboard.user = userAddress.toHex();
  }
  return tokenLeaderboard;
}
export function handleDepositInfo(event: DepositInfoEvent): void {
  let deposit = initDeposit(event.params.token, event.transaction, event.params.user);
  let tokenLeaderboard = initTokenLeaderboard(event.params.token, event.params.user);

  tokenLeaderboard.url = event.params.url;
  tokenLeaderboard.title = event.params.title;
  tokenLeaderboard.image = event.params.image;
  tokenLeaderboard.save();

  deposit.url = event.params.url;
  deposit.title = event.params.title;
  deposit.image = event.params.image;
  deposit.save()
}


// Handle MetaEvent
export function handleMetaEvent(event: MetaEvent): void {
  let id = event.params.key.toString(); // Use key as the ID
  let metaEvent = MetaEventEntity.load(id);

  if (metaEvent == null) {
    metaEvent = new MetaEventEntity(id);
  }

  metaEvent.key = event.params.key;
  metaEvent.value = event.params.value;

  metaEvent.save();
}

function handlerUserTokenInfoInit(userId:string, _tokenId:string ):UserTokenInfo {
  let userTokenInfoId = userId + "-" + _tokenId;
  log.info("userId {}", [userId]);

  let userTokenInfo = UserTokenInfo.load(userTokenInfoId);
  if (userTokenInfo === null) {
    userTokenInfo = new UserTokenInfo(userTokenInfoId);
    userTokenInfo.user = userId;
    userTokenInfo.token = _tokenId;
    userTokenInfo.totalEarnings = BigInt.fromI32(0);
    userTokenInfo.totalDeposited = BigInt.fromI32(0);
    userTokenInfo.referralEarnings = BigInt.fromI32(0);
    userTokenInfo.commEarnings = BigInt.fromI32(0);
    userTokenInfo.receiverEarnings = BigInt.fromI32(0);
  }

  return userTokenInfo
}

function initUser(userId:string): User {
  let user = User.load(userId);
  if (user === null) {
    user = new User(userId);
  }

  return user;
}

export function handleReceiverChanged(event: ReceiverChangedEvent): void {
  log.info("handleReceiverChanged {},{}", [event.params.oldReceiver.toHex(), event.params.newReceiver.toHex()])
  let config = Config.load("config")
  if (!config) {
    config = new Config("config")
  }
  const newReceiverUser = initUser(event.params.newReceiver.toHex());
  newReceiverUser.save();

  config.receiver = event.params.newReceiver.toHex();

  config.save()
}

export function handleReferrerQuoteChanged(event: ReferrerQuoteChangedEvent): void {
  log.info("handleReferrerQuoteChanged {},{}", [event.params._old.toString(), event.params._new.toString()]);
  let config = Config.load("config")
  if (!config) {
    config = new Config("config")
  }
  config.referrerPercentage = event.params._new;
  config.save()
}
export function handleCommQuoteChanged(event: CommQuoteChangedEvent): void {
  log.info("handleCommQuoteChanged {},{}", [event.params._old.toString(), event.params._new.toString()]);
  let config = Config.load("config")
  if (!config) {
    config = new Config("config")
  }
  config.commPercentage = event.params._new
  config.save()
}

function initDeposit(token:Address, transaction:ethereum.Transaction, user:Address):DepositEntity{
  let deposit = DepositEntity.load(transaction.hash.toHex())
  if (!deposit) {
    deposit = new DepositEntity(transaction.hash.toHex());
    deposit.token = token.toHex();
    deposit.amount = BigInt.fromU32(0);
    deposit.userTokenInfo = user.toHex() + "-" +token.toHex();
    const config = Config.load("config");
    deposit.referrerPercentage = config!.referrerPercentage;
    deposit.commPercentage = config!.commPercentage;
    deposit.receiver = config!.receiver;
    deposit.transaction = transaction.hash.toHex();
  }
  return deposit;
}