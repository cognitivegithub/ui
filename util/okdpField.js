
Ext.define('Application.components.okdpField', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите код или наименование из ОКДП',
  initComponent: function() {
    this.directFn = RPC.Reference.okdpSearch;
    this.storeValueField = 'okdp';
    Application.components.okdpField.superclass.initComponent.call(this);
  }
});
