class PricingService {
  calculatePrice({
    distance,
    detourPercent
  }) {
    const baseFare = 100;
    const ratePerKm = 12;
    const poolDiscount = 0.15;
    const surgeMultiplier = 1.0;
    const basePrice = baseFare+(distance*ratePerKm);
    const detourPenalty = basePrice*(detourPercent / 100)*0.5;
    const discounted = (basePrice+detourPenalty) *(1-poolDiscount);
    const finalPrice = discounted*surgeMultiplier;

    return Number(finalPrice.toFixed(2));
  }
}

export default new PricingService();
