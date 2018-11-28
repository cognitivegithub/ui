
Ext.define('Application.components.priceField', {
  extend: 'Application.components.numberField',
  decimalPrecision: 2,
  minValue: ONE_KOPECK,
  allowNegative: false,
  maxValue: MAX_PRICE,
  parser: function(value) {
    var newvalue = parsePrice(value);
    return Math.round(newvalue*100)/100;
  },
  renderer: function(value) {
    return Ext.util.Format.price(value);
  }
});
