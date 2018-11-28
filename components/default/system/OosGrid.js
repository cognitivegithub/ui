
Ext.define('Application.components.OosGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,

  initComponent : function () {
    var component = this;
    this.addEvents('search');

    if (!this.filter_key) {
      this.filter_key = null;
    }
    if (!this.filter_value) {
      this.filter_value = null;
    }

    var store = createOosStore(this.filter_key, this.filter_value);

    function resultRenderer(val) {
      switch(val) {
        case true: return 'Успешно';
        case false: return 'Ошибки';
        default: return 'Ожидание обработки';
      }
    }

    var grid_columns = [];
    grid_columns.push(
      {header: 'Дата и время', width: 60, dataIndex: 'date_created', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s'), sortable: true},
      {header: 'Направление', width: 20, dataIndex: 'direction_to', sortable: false},
      {header: 'Событие', dataIndex: 'event',  sortable: true},
      {header: 'GUID', dataIndex: 'guid',  sortable: true, hidden: true},
      {header: 'Результат', dataIndex: 'response', width: 40, sortable: true, renderer: resultRenderer},
      {header: 'Операции', xtype: 'textactioncolumn', width: 30, actionsSeparator: ' ',
        items: [
          {
            tooltip: 'Скачать XML',
            icon: '/images/icons/silk/package.png',
            isHidden: function(v, m, r) {
              var isUserOOZ = isUserPerfomerOOZUnit() || isUserDeputyHeadOOZ() || isUserHeadOOZ();
              return r.data.url_xml == null || !isUserOOZ;
            },
            scope: this,
            text: '',
            href: function(v,m,r) {
              return r.data.url_xml;
            }
          }, {
            tooltip: 'Скачать XML подтверждения',
            icon: '/images/icons/silk/page_key.png',
            isHidden: function(v, m, r) {
              return r.data.url_xml_confirm==null
              //return true
            },
            scope: this,
            text: '',
            href: function(v,m,r) {
              return r.data.url_xml_confirm;
            }
          }, {
            tooltip: 'Подробности ошибки, переданные с ЕИС',
            icon: '/ico/errors.png',
            isHidden: function(v, m, r) {
              return (r.data.details=="" || r.data.details == null);
            },
            scope: this,
            handler: function(grid, rowIndex){
              var item = grid.store.getAt(rowIndex);
              if (!item || !item.data ) {
                return;
              }
              Ext.Msg.alert('Подробности ошибки, переданные с ЕИС', item.data.details);
            }
          },
          {
            tooltip: 'Повторить отправку',
            icon: '/ico/procedures/replay.png',
            isHidden: function(v, m, r) {
              if ((Main.config.oos_enable_requeue && !isAdmin())) {
                return true;
              }
              return (r.data.response!==false);
            },
            scope: this,
            handler: function(grid, rIndex) {
              var item = grid.store.getAt(rIndex);
              if (!item || !item.data ) {
                return;
              }
              RPC.Procedure.requeueOosMessage({queue_id: item.data.id}, function(result) {
                if(result.success) {
                  echoResponseMessage(result);
                  grid.getStore().reload();
                } else {
                  echoResponseMessage(result);
                }
              });
            }
          },
          {
            tooltip: 'Перейти к публикации в ЕИС',
            icon: '/images/icons/silk/door_out.png',
            isHidden: function(v, m, r) {
              return (r.data.url_oos==null);
            },
            text: '',
            scope: this,
            href: function(v,m,r) {
              return r.data.url_oos;
            }
          }
        ]}
    );

    Ext.apply(this,
      {
        store: store,
        columns: grid_columns,
        viewConfig: {
          forceFit: true
        },
        bbar: renderPagingToolbar('Записи', store, 50),
        loadMask: true,
        listeners: {
          render: function() {
            this.fireEvent('search');
          },
          search: function(query, search_params) {
            var store = this.getStore();
            if (search_params) {
              for (var sp in search_params)
                store.setBaseParam(sp, search_params[sp]);
            }
            store.setBaseParam('query', query);
            store.setBaseParam('start', 0);
            store.setBaseParam('limit', 50);
            store.load();
          }
        }
      }
    );

    Application.components.OosGrid.superclass.initComponent.call(this);
  }
});
