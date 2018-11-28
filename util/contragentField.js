
Ext.define('Application.components.contragentField', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите наименование заказчика',
  initComponent: function() {
    this.directFn = RPC.Reference.contragentSearch;
    this.storeValueField = 'contragents';
    this.storeNameField = 'short_name';
    this.minChars = 2;
    var tpl = new Ext.XTemplate(
        '<tpl for=".">'+
          '<div class="search-item {[xindex % 2 === 0 ? "x-even" : "x-odd"]}">'+
            '{values.' + this.storeValueField + '}; {values.' + this.storeNameField + '}</div>' +
        '</tpl>');
    this.listTpl = tpl;
    Application.components.contragentField.superclass.initComponent.call(this);
  }
});
