
Ext.define('Application.components.percentField', {
  extend: 'Application.components.numberField',
  decimalPrecision: 1,
  parser: function(value) {
    if (Ext.isString(value)) {
      value = value.replace('%', '');
    }
    var newvalue = parsePrice(value);
    var d = Math.pow(10, this.decimalPrecision);
    return Math.round(newvalue*d)/d;
  },
  renderer: function(value) {
    var ds = Ext.util.Format.numberFormat.decimalSeparator;
    var v = value+' %';
    if (ds!='.') {
      v = v.replace('.', ds);
    }
    return v;
  }
});
