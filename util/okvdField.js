
Ext.define('Application.components.okvdField', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите код или наименование из ОКВЭД',
  initComponent: function() {
    this.directFn = RPC.Reference.okvdSearch;
    this.storeValueField = 'okved';
    Application.components.okvdField.superclass.initComponent.call(this);
  }
});
