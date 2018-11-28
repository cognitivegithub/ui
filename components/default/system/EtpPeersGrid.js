
 Ext.define('Application.components.EtpPeersGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var store_peers = createEtpPeersStore();
    
    function rendererPeerType(val) {
      var result = 'отключена';
      if (val == 1) {
        result = 'master';
      } else if (val == 2) {
        result = 'slave';
      }
      return result;
    }

    Ext.apply(this,
    {
      store: store_peers,
      columns: [
          {header: 'Название системы', width: 150, dataIndex: 'name'},
          {header: 'Код', width: 30, dataIndex: 'code'},
          {header: 'Точка доступа', width: 100, dataIndex: 'endpoint'},
          {header: 'Тип', width: 50, dataIndex: 'type', renderer: rendererPeerType},
          {header: 'Операции', xtype: 'textactioncolumn', width: 50, actionsSeparator: ' ',
            items:[{
              tooltip: 'Изменить',
              icon: '/ico/edit.png',
              isHidden: function(v, m, r) {
                return false;
              },
              handler: function(grid, rowIndex, colIndex) {
                var store = grid.getStore();
                var record = store.getAt(rowIndex);
                var win = new Ext.Window({
                  closeAction: 'hide',
                  width: 700,
                  autoHeight: true,
                  title: 'Смежная система '+record.data.name,
                  items: [
                    {
                      xtype: 'Application.components.EtpPeersForm',
                      peer_id: record.id,
                      close_fn: function() {
                        win.close();
                      },
                      save_fn: function() {
                        store_peers.load();
                        win.close();
                      }
                    }
                  ]
                });
                win.show();
              }
            }]
      }],
      viewConfig: {
        forceFit: true
      },
      tbar: [{
        text: 'Добавить смежную систему',
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
        handler: function() {
          var win_new = new Ext.Window({
            closeAction: 'hide',
            width: 700,
            autoHeight: true,
            title: 'Новая смежная система',
            items: [
              {
                xtype: 'Application.components.EtpPeersForm',
                peer_id: null,
                close_fn: function() {
                  win_new.close();
                },
                save_fn: function() {
                  store_peers.load();
                  win_new.close();
                }
              }
            ]
          });
          win_new.show();
        }
      }],
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          store_peers.load();
        }
      }
    }
    );

    Application.components.EtpPeersGrid.superclass.initComponent.call(this);
  }
});
