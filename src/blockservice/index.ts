import Bitswap from 'ipfs-bitswap'
import CID from 'cids'
import { Blockstore, Block } from '../blockstore'

/**
 * `BlockService` is a hybrid block data-store.
 * It stores data in a local data-store and may retrieve data from a remote exchange.
 */
export class BlockService {
  /**
   * `constructor` creates a new BlockService.
   * @param store The block store to use for local block storage.
   * @param exchange Add a "bitswap" instance that communicates with the network to retrieve blocks that are not in
   * the local store. If the node is online, all requests for blocks first check locally and then ask the network
   * for the blocks. To 'go offline', simply set `exchange` to undefined or null.
   */
  constructor(public store: Blockstore, public exchange?: Bitswap) {}

  /**
   * `online` returns whether the block-service is online or not.
   * i.e. does it have a valid exchange?
   */
  online() {
    return this.exchange != null
  }

  /**
   * `put` adds a block to the underlying block store.
   *
   * @param block An immutable block of data.
   */
  async put(block: Block) {
    if (this.exchange != null) {
      return this.exchange.put(block)
    } else {
      return this.store.put(block)
    }
  }

  /**
   * `putMany` adds multiple blocks to the underlying block store.
   *
   * @param blocks An iterable of immutable blocks of data.
   */
  async putMany(blocks: Iterable<Block>) {
    if (this.exchange != null) {
      return this.exchange.putMany(blocks)
    } else {
      return this.store.putMany(blocks)
    }
  }

  /**
   * `get` returns a block by cid.
   * If the block is not available locally and the exchange is online, it will request the block from the
   * exchange/network.
   *
   * @param cid The content identifier for an immutable block of data.
   */
  async get(cid: CID): Promise<Block> {
    if (this.exchange != null) {
      return this.exchange.get(cid)
    } else {
      return this.store.get(cid)
    }
  }

  /**
   * `getMany` returns multiple blocks from an iterable of CIDs.
   * If any of the blocks are not available locally and the exchange is online, it will request the block(s) from the
   * exchange/network.
   *
   * @param cids Iterable of content identifiers for immutable blocks of data.
   */
  async *getMany(cids: Iterable<CID>): AsyncIterator<Block> {
    if (this.exchange != null) {
      return this.exchange.getMany(cids)
    } else {
      for (const cid of cids) {
        yield this.store.get(cid)
      }
    }
  }

  /**
   * `delete` removes a block from the local block store.
   *
   * @param cid The content identifier for an immutable block of data.
   */
  async delete(cid: CID) {
    return this.store.delete(cid)
  }
}
