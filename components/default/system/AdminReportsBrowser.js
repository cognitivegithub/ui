Ext.define('Application.components.AdminReportsBrowser', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var store = new Ext.data.DirectStore({
    directFn: RPC_po.Report.list,
    paramsAsHash: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['name', 'size', 'date', 'type'],
    remoteSort: false,
    autoLoad: true
  });

  Ext.apply(this,
    {
      store: store,
      columns: [
          {header: 'Имя', dataIndex: 'name'}
        //  {header: 'Размер', width: 50, dataIndex: 'size'},
        //  {header: 'Дата', width: 50, dataIndex: 'date'}
      ],
      viewConfig: {
        forceFit: true
      },
      tbar: [{
        text: 'Добавить',
        // Функционал отключен.
        hidden: true,
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
        handler: function() {
          var name_id = Ext.id();
          var folder = "";
          var cookie = Ext.util.Cookies.get("report_folder");
          if (cookie!=null) {
            folder = cookie+"+";
          }
          var win = new Ext.Window({
            closeAction: 'close',
            width: 400,
            autoHeight: true,
            title: 'Новый шаблон',
            items: [
              {
                xtype: 'form',
                bodyStyle: 'padding: 5px 5px 0 5px;',
                frame : false,
                border : false,
                items: [
                  {
                    xtype: 'textfield',
                    id: name_id,
                    name: 'templ_name',
                    fieldLabel: 'Имя файла'
                  }
                ]
              }
            ],
            buttons: [
              {
                text: 'Отмена',
                handler: function() {
                  win.close();
                }
              },
              {
                text: 'Создать',
                handler: function() {
                  var file_name = Ext.getCmp(name_id).getValue();
                  openLink("/report/designer/name/"+folder+file_name+'.mrt');
                  win.close();
                }
              }
            ]
          });
          win.show();
        }
      }],
      bbar: renderPagingToolbar('Файлы', store, 50),
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        rowdblclick: function(grid, rowIndex, e) {
          var store = grid.getStore();
          var record = store.getAt(rowIndex);
          if (record.json.type=='d') {
            store.setBaseParam('folder', record.json.path);
            store.load();
          }
        }
      }
    }
    );

    Application.components.AdminReportsBrowser.superclass.initComponent.call(this);
  }
});
