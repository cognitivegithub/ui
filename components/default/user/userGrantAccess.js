Ext.define('Application.components.UserGrantAccess', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    var user_id = this.user_id;
    var store = createShareAccessStore(user_id);
    var grant_access_grid_id = Ext.id();
    var osf_checkBox_id = Ext.id();
    var sap_checkBox_id = Ext.id();
    
    var grid = new Ext.grid.GridPanel({
    autoHeight: true,
    id: grant_access_grid_id,
    store: store,
    disabled: true,
    grid_only: false,
    ref: '../grid',
    colModel: new Ext.grid.ColumnModel({
        defaults: {
            width: 120,
            autoHeight: true,
            sortable: true
        },
        columns: [
            {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true},
            {header: 'Пользователь', dataIndex: 'user', flex: 1, sortable: false},
            {header: 'Выбрать', dataIndex: 'choose', width: 20, xtype: 'checkcolumn', sortable: false}
        ],
        bbar: new Ext.Toolbar({
        items: [{
          cls:'x-btn-text-icon',
          icon: 'ico/database_save.png',
          text: 'Сохранить',
          handler: function(){
            store.save();
          }
        }]})
    }),
    viewConfig: {
        forceFit: true,
        hideTitle: true,
        headersDisabled: true
    },
    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
    frame: false,
    title: 'Список пользователей',
    iconCls: 'icon-grid',
    listeners: {
        update: function(store){
            store.save();
        }
        
    }
});
    
    
   
    Ext.apply(this, {
        items: [{
        xtype: 'fieldset',
        defaults: {
          anchor: '100%'
        },
        items: [{
          xtype: 'checkbox',
          name: 'only_own_procedures',
          boxLabel: 'Доступ только к своим процедурам',
          id: osf_checkBox_id
        }]
      },
      {
        xtype: 'fieldset',
        autoHeight: true,
        defaults: {
          anchor: '100%'
        },
        items: [{
          xtype: 'checkbox',
          name: 'share_access',
          boxLabel: 'Замещение пользователя пользователем из списка',
          id: sap_checkBox_id,
          handler: function(){
                  flag = Ext.getCmp(sap_checkBox_id).getValue();
                  if (flag == true){
                      Ext.getCmp(grant_access_grid_id).enable();
                  }
                  else{
                      Ext.getCmp(grant_access_grid_id).disable();
                  }
                }
        }, grid
        ]
      }],
      listeners: {
        beforerender: function() {
            performRPCCall(RPC.User.getAccessCheckboxes, [{user_id: user_id}], {wait_disable : true}, function (response){
                flag1 = response.data['only_own_procedures'];
                flag2 = response.data['share_access'];
                Ext.getCmp(osf_checkBox_id).setValue(flag1);
                Ext.getCmp(sap_checkBox_id).setValue(flag2);
            });
        }
      }
    });
    
    
    Application.components.UserGrantAccess.superclass.initComponent.call(this);
  }
});


