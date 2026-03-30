const crypto = require('crypto');

/**
 * Generates a SHA-256 transaction hash chained to the previous hash.
 * This simulates a blockchain ledger where each tx references the previous.
 */
const generateTxHash = (prevHash, txData) => {
  const payload = `${prevHash}${txData.senderId}${txData.receiverId}${txData.amount}${txData.timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

/**
 * Gets the last transaction hash to chain from (the blockchain tip).
 */
const getChainTip = async (Transaction) => {
  const lastTx = await Transaction.findOne().sort({ blockIndex: -1 }).lean();
  return lastTx ? lastTx.txHash : '0000000000000000000000000000000000000000000000000000000000000000';
};

module.exports = { generateTxHash, getChainTip };
