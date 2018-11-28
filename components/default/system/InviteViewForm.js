
Ext.define('Application.components.InviteViewForm', {
  extend: 'Ext.form.Panel',
  frame: true,
  autoHeight: true,
  initComponent: function() {
    var component = this;

    Ext.apply(this, {
      labelWidth: 150,
      defaults: {
        anchor: '100%'
      },
      bodyCssClass: 'subpanel-top-padding',
      items: [
        {
          xtype: 'textfield',
          fieldLabel: 'Тема приглашения',
          readOnly: true,
          value: component.invite_data.subject
        }, {
          xtype: 'textarea',
          fieldLabel: 'Текст приглашения',
          height: 200,
          readOnly: true,
          value: component.invite_data.text
        }, {
          xtype: 'tabpanel',
          activeTab: 0,
          height: 300,
          enableTabScroll:false,
          border: false,
          items: [
            {
              xtype: 'grid',
              store: new Ext.data.Store({
                data: component.invite_data.contragents,
                reader: new Ext.data.ArrayReader({id: 'id'}, ['id', 'name'])
              }),
              columns: [
                {header: 'Ид', dataIndex: 'id', width: 50},
                {header: 'Название', dataIndex: 'name', width: 600}
              ],
              closable: false,
              title: 'Заявители'
            }, {
              xtype: 'grid',
              store: new Ext.data.Store({
                data: component.invite_data.categories,
                reader: new Ext.data.ArrayReader({id: 'id'}, ['id', 'name'])
              }),
              columns: [
                {header: 'Ид', dataIndex: 'id', width: 50},
                {header: 'Название', dataIndex: 'name', width: 600}
              ],
              closable: false,
              title: 'Категории'
            }
          ]
        }
      ],
      buttons: [{
        text: 'Закрыть',
        handler: function() {
          component.close_fn();
        }
      }]
    });
    Application.components.InviteViewForm.superclass.initComponent.call(this);
  }
});
