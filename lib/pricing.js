'use strict';

const {
  getJSON
} = require('./util');

function _getOffers() {
  const offers = getJSON('/offers/v1.0/aws/index.json');
  return offers.offers;
}

function _getOffer(name, region) {
  if (!name) {
    throw 'Name required';
  }
  const offer = _getOffers()[name];
  if (!offer || !offer.currentVersionUrl) {
    throw 'Offer not found';
  }

  if (offer.currentRegionIndexUrl) {
    if (!region) {
      throw 'Missing region';
    }
    const regions = getJSON(offer.currentRegionIndexUrl);
    const r = regions.regions[region];
    if (!r) {
      throw 'Region not found';
    }
    return getJSON(r.currentVersionUrl);
  }
  return getJSON(offer.currentVersionUrl);
}


function _getSortedPrices(prices) {
  const a = [];
  for (const k in prices) {
    a.push(prices[k]);
  }

  return a.sort((a, b) => +a.beginRange === +b.beginRange ? 0 : +a.beginRange > +b.beginRange ? 1 : -1);
}

module.exports = {

  getOffers() {
    return Object.keys(_getOffers());
  },


  getOfferRegions(name) {
    if (!name) {
      throw 'Name is required';
    }
    const offer = _getOffers()[name];
    if (!offer) {
      throw 'Offer not found';
    }
    if (!offer.currentRegionIndexUrl) {
      return ['global'];
    }
    const res = getJSON(offer.currentRegionIndexUrl);
    return Object.keys(res.regions);
  },


  getOfferProducts(name, region) {
    const offer = _getOffer(name, region);
    const products = offer.products;
    const a = [];
    for (const k in products) {
      a.push(products[k]);
    }

    a.get = (filter) => {
      for (const item of a) {
        if (filter(item)) return item;
      }
      return null;
    };

    a.eval = (filter, type, attributes) => {
      type = type || 'OnDemand';
      attributes = attributes || {};
      const product = a.get(filter);

      if (!product || !offer.terms[type]) return [];
      const terms = offer.terms[type][product.sku];
      if (!terms) return [];
      const details = [];
      for (const k in terms) {
        const term = terms[k];
        term.termAttributes = term.termAttributes || {};
        if (type === 'Reserved') {
          if (attributes.lease !== term.termAttributes.LeaseContractLength) continue;
          if (term.termAttributes.OfferingClass) {
            if (!attributes.leaseConvertible && term.termAttributes.OfferingClass !== 'standard')
              continue;
            if (attributes.leaseConvertible && term.termAttributes.OfferingClass !== 'convertible')
              continue;
          }
          if (attributes.upfront && (
              attributes.upfront === 'no' && term.termAttributes.PurchaseOption !== 'No Upfront' ||
              attributes.upfront === 'partial' && term.termAttributes.PurchaseOption !== 'Partial Upfront' ||
              attributes.upfront === 'all' && term.termAttributes.PurchaseOption !== 'All Upfront'
            )) {
            continue;
          }
        }
        const prices = term.priceDimensions;
        const consummed = {};
        for (const price of _getSortedPrices(prices)) {
          consummed[price.unit] = consummed[price.unit] || 0;
          let qty = (attributes[price.unit] || 0) - consummed[price.unit];
          const value = +price.pricePerUnit.USD;
          const beginRange = +price.beginRange;
          const endRange = +price.endRange;

          if (!isNaN(beginRange)) {
            qty = Math.min(qty, isNaN(endRange) ? qty : endRange - beginRange);
            consummed[price.unit] += qty;
          }

          if (qty <= 0) {
            continue;
          }
          details.push({
            title: `${product.attributes.group || product.attributes.servicename}`,
            description: `${price.description}`,
            pu: value,
            unit: price.unit,
            qty,
            total: qty * value,
            lease: attributes.lease,
            fee: !!(price.unit === 'Quantity' && ~price.description.indexOf('Fee')),
            currency: 'USD'
          });
        }
      }
      return details;
    };

    return a;
  }

};