Application.components.UserSearchForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    this.addEvents('dologin');
    Ext.apply(this, {
      autoHeight: true,
      width: '100%',
      layout : 'column',
      title: 'Быстрый поиск',
      labelWidth: 140,
      frame: true,
      items : [
      {
        xtype: 'panel',
        layout: 'form',
        width: 300,
        items: [
        {
          xtype: 'textfield',
          name: 'query',
          id: 'query',
          fieldLabel: 'Запрос для поиска'
        }]
        }, {
          xtype: 'button',
          text: 'Искать',
          scope: this,
          formBind : true,
          handler: function(){
            var query = Ext.getCmp('query').getValue();
            Ext.getCmp('userPanel').getStore().setBaseParam('query', query);
            Ext.getCmp('userPanel').getStore().load();
          }
        }
    ]
    });
    Application.components.LoginForm.superclass.initComponent.call(this);
  }
});
