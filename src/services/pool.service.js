import prisma from "../config/db.js";
import poolRepository from "../repositories/pool.repository.js";

class PoolService {

  async getActivePools() {
    return prisma.$transaction(async (tx) => {
      return await poolRepository.getActivePools(tx);
    });
  }

  async getPoolById(poolId) {
    return prisma.$transaction(async (tx) => {
      const pool = await poolRepository.getPoolById(
        Number(poolId),
        tx
      );

      if (!pool) {
        throw new Error("Pool not found");
      }
      return pool;
    });
  }
}

export default new PoolService();
