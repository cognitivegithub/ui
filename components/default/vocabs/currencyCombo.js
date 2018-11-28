Ext.define('Application.components.vocabsCurrencyCombo', {
  extend: 'Application.components.combo',
  fieldLabel: 'Валюта',
  initComponent: function () {
    var store = getCurrencyStore();
    Ext.apply(this, {
      editable: false,
      store: store,
      valueField: 'id',
      displayField: 'description',
      name: 'currency',
      value: this.value ? this.value.currency : 810,
      mode: 'local',
      triggerAction: 'all',
      itemCls: 'required',
      renderer: function (values) {
        return Ext.util.Format.countryFlag(values.alpha2 || values.alpha3) + ' ' + values.description;
      }
    });
    Application.components.vocabsCurrencyCombo.superclass.initComponent.call(this);
  }
});