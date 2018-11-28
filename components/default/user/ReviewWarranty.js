/**
 * Компонент выводит форму рассмотрения заявки на регистрацию доверенности пользователя.
 *
 * Параметры:
 *   user_id - идентификатор пользователя
 *   accr_id - идентификатор заявки
 */

Ext.define('Application.components.ReviewWarranty', {
  extend: 'Ext.Panel',
  autoHeight: true,
  frame: true,
  border: false,
  cls: 'spaced-panel',
  initComponent: function() {
    var component = this;

    Ext.apply(this, {
      frame: true,
      title: 'Рассмотрение заявки на регистрацию доверенности',
      width: 700,
      defaults: {
        xtype: 'fieldset',
        autoHeight: true
      },
      items: [{
        title: 'Принять заявку',
        items: [{
          xtype: 'Application.components.userAccreditationAgreeForm',
          user_id: component.user_id,
          accr_id: component.accr_id,
          is_admin: (component.user_type === 'admin') ? true : false,
          grid_only: true,
          api: {submit: RPC.User.signUserWarranty}
        }]
      }, {
        title: 'Отклонить заявку',
        items: [{
          xtype: 'Application.components.userAccreditationDeclineForm',
          user_id: component.user_id,
          accr_id: component.accr_id,
          api: {submit: RPC.User.signUserWarranty}
        }]
      }, {
        xtype: 'hidden',
        name: 'choise',
        id: 'contragent_admin_choise'
      }, {
        xtype: 'hidden',
        name: 'signature'
      }]
    });
    Application.components.ReviewWarranty.superclass.initComponent.call(this);
  }
});
