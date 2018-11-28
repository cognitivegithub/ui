
Ext.define('Application.components.okved2Field', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите код или наименование из ОКВЭД2',
  initComponent: function() {
    this.directFn = RPC.Reference.okved2Search;
    this.storeValueField = 'okved2';
    Application.components.okved2Field.superclass.initComponent.call(this);
  }
});
