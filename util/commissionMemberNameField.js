Ext.define('Application.components.commissionMemberNameField', {
  extend: 'Application.components.autocompleteField',
  emptyText: 'Введите ФИО члена коммиссии',
  initComponent: function() {
    this.directFn = RPC.Reference.getCommissionAvailableToAddMembers;
    this.minChars = 1;
    this.storeValueField = 'member_fio';
    Application.components.commissionMemberNameField.superclass.initComponent.call(this);
  }
});