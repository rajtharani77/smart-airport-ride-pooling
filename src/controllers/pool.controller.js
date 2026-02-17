import poolService from "../services/pool.service.js";

class PoolController {
  async getActive(req, res, next) {
    try {
      const pools = await poolService.getActivePools();
      res.status(200).json(pools);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pool = await poolService.getPoolById(id);
      res.status(200).json(pool);
    } catch (error) {
      next(error);
    }
  }
}

export default new PoolController();
