
Ext.define('Application.components.valueField', {
  extend: 'Ext.panel.Panel',
  labelSeparator: ':',
  initComponent: function() {
    this.html = this.formatValueString(this.value),
    Application.components.valueField.superclass.initComponent.call(this);
  },
  formatValueString: function(v, raw) {
    if (v && !Ext.isString(v)) {
      v = v.toString();
    }
    return this.fieldLabel+this.labelSeparator+(v?(' <b>'+(raw?v:v.escapeHtml())+'</b>'):'');
  },
  setValue: function(v, raw) {
    this.value = v;
    this.update(this.formatValueString(this.value, raw));
  },
  getValue: function() {
    return this.value;
  }
});
