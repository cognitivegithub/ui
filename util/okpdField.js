
Ext.define('Application.components.okpdField', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите код или наименование из ОКПД',
  initComponent: function() {
    this.directFn = RPC.Reference.okpdSearch;
    this.storeValueField = 'okpd';
    Application.components.okpdField.superclass.initComponent.call(this);
  }
});
