
Ext.define('Application.components.okvedField', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите код или наименование из ОКВЭД',
  initComponent: function() {
    this.directFn = RPC.Reference.okvedSearch;
    this.storeValueField = 'okved';
    Application.components.okvedField.superclass.initComponent.call(this);
  }
});
