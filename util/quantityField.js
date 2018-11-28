Ext.define('Application.components.quantityField', {
  extend: 'Application.components.numberField',
  zeroText: 'Значение должно быть не нулевым',
  inputText: 'Не удалось понять ваш ввод. Используйте число, отделяя десятичные знаки запятой или точкой, и разделяя тысячи (если нужно) пробелами',
  negativeText:  'Значение должно быть положительным',
  minValueText: 'Значение должно быть не меньше чем',
  maxValueText: 'Значение должно быть не больше чем',
  renderPrecision: true,
  allowFloat: true,
  allowBlank: false,
  allowZero: false,
  initComponent: function() {
    if (this.allowBlank) {
      Ext.apply(this, {
        allowZero: true
      });
    }
    Application.components.quantityField.superclass.initComponent.call(this);
  },
  parser: function(value) {
    if (value == '') return 0;
    if (this.allowFloat) {
      return parseFloat(value);
    } else {
      return parseInt(value);
    }
  },
  renderer: function(value) {
    if (this.allowBlank && parsePrice(value) == 0) {
      return '';
    }
    var tpl = '0';
    if (this.allowFloat && (this.renderPrecision || parsePrice(value).toString().indexOf('.') != -1)) {
      tpl = '0.00';
    }
    if (this.precision !== undefined) {
      tpl = '0.';
      for (var i = 0; i < this.precision; i++) {
        tpl += '0';
      }
    }
    return Ext.util.Format.number(value, tpl);
  },
  validator: function(value) {
    value = this.parser(value);
    if (!this.allowNegative && value < 0) {
      return this.negativeText;
    }
    if (!this.allowZero && 0 == value) {
      return this.zeroText;
    }
    if (null !== this.minValue && value < this.minValue) {
      return this.minValueText + ' ' + this.renderer(this.minValue);
    }
    if (null !== this.maxValue && value > this.maxValue) {
      return this.maxValueText + ' ' + this.renderer(this.maxValue);
    }
    if (false === value) {
      return this.inputText;
    }
    return true;
  }
});
