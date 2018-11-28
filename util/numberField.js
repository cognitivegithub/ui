
Ext.define('Application.components.numberField', {
  extend: 'Ext.form.TextField',
  maskRe: /\d|\s|[,.+\-]/,
  decimalSeparator: ',',
  decimalPrecision: 2,
  decimalPrecisionMax: null,
  renderer: function(v){
    return number_format(v, {
      dec_point: this.decimalSeparator,
      decimals: this.decimalPrecision, 
      thousands_sep: ' '
    });
  },
  parser: function(v){return parsePrice(v);},
  allowNegative: false,
  allowZero: true,
  correctOnBlur: true,
  resetOnError: false,
  minValue: null,
  maxValue: null,
  oldValue: null, // private
  setMinValue: function (value) {
    this.minValue = value;

    return this;
  },
  setMaxValue: function (value) {
    this.maxValue = value;

    return this;
  },
  initComponent: function() {
    Application.components.numberField.superclass.initComponent.call(this);
    if (this.correctOnBlur) {
      this.on('change', this.onChange);
    }
    if (null == this.decimalPrecisionMax) {
      this.decimalPrecisionMax = this.decimalPrecision;
    }
  },
  setValue: function(value) {
    var newvalue = value;
    if (!this.isValueEmpty(value)) {
      newvalue = this.parser(value);
      newvalue = this.renderer(newvalue);
    }
    return Application.components.numberField.superclass.setValue.call(this, newvalue);
  },
  onChange: function(input, value, oldvalue) {
    var newvalue = value;
    if (!this.isValueEmpty(value)) {
      newvalue = this.parser(value);
      if (!input.resetOnError && false===newvalue) {
        return;
      }
      newvalue = this.renderer(newvalue);
    }
    if (newvalue!=value) {
      input.setValue(newvalue);
    }
  },
  isValueEmpty: function(value) {
    return (value===false || value===null || value===undefined || value==='');
  },
  getValue: function() {
    var value = Application.components.numberField.superclass.getValue.call(this);
    if (this.isValueEmpty(value)) {
      return null;
    }
    if (value!=this.oldValue) {
      this.oldValue = value;
      this.fireEvent('change', this, value, this.oldValue)
    }
    return this.parser(value);
  },
  reset: function() {
    Application.components.numberField.superclass.setValue.call(this, '');
    this.clearInvalid();
  },
  validator: function(value) {
    if (this.isValueEmpty(value)) {
      return true;
    }
    value = this.parser(value);
    if (null!==this.minValue && value<this.minValue) {
      return 'Значение должно быть не меньше чем '+Ext.util.Format.price(this.minValue, {decimalPrecision: this.decimalPrecision});
    }
    if (null!==this.maxValue && value>this.maxValue) {
      return 'Значение должно быть не больше чем ' + 
      Ext.util.Format.price(this.maxValue, {decimalPrecision: this.decimalPrecisionMax});
    }
    if (false===value) {
      return 'Не удалось понять ваш ввод. Используйте число, отделяя десятичные знаки запятой или точкой, и разделяя тысячи (если нужно) пробелами';
    }
    if (!this.allowNegative && value<0) {
      return 'Значение должно быть положительным';
    }
    if (!this.allowZero && 0==value) {
      return 'Значение должно быть не нулевым';
    }
    return true;
  }
});
