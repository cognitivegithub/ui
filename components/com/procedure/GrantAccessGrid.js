Ext.define('Application.components.GrantAccessGrid', {
  extend:  'Ext.form.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var proc_id = this.proc_id;
    var  grant_access_grid_id = Ext.id();
    var store = createShareProcAccessStore(proc_id);
    var grid = new Ext.grid.GridPanel({
        autoHeight: true,
        id: grant_access_grid_id,
        store: store,
        grid_only: true,
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
            ]
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
    
    Ext.apply(this,
    {
      //store: store,
      items: [grid]
    }
    );

    Application.components.GrantAccessGrid.superclass.initComponent.call(this);
  }
});


