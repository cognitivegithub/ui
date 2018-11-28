
Ext.define('Application.components.okpd2Field', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите код или наименование из ОКПД2',
  initComponent: function() {
    this.directFn = RPC.Reference.okpd2Search;
    this.storeValueField = 'okpd2';
    Application.components.okpd2Field.superclass.initComponent.call(this);
  }
});
