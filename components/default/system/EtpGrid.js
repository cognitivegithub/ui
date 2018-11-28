Ext.define('Application.components.EtpGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,

  initComponent : function () {
    this.addEvents('search');

    if (!this.filter_key) {
      this.filter_key = null;
    }
    if (!this.filter_value) {
      this.filter_value = null;
    }
    if (!this.etp_place) {
      this.etp_place = null;
    }

    var store = createEtpStore(this.filter_key, this.filter_value, this.etp_place);

    /**
     * Рендер булевых значений.
     *
     * @param {bool} val Булево значение.
     *
     * @return {string} Значение
     */
    function resultRenderer(val) {
      switch (val) {
        case true: return 'Успешно';
        case false: return 'Ошибки';
        default: return 'Ожидание обработки';
      }
    }

    var grid_columns = [];
    grid_columns.push(
      {header: 'Дата и время', width: 60, dataIndex: 'date_created',
        renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s'), sortable: true},
      {header: 'Событие', dataIndex: 'type', sortable: true},
      {header: 'Сообщение', dataIndex: 'response_message', width: 200, sortable: true},
      {header: 'Результат', dataIndex: 'success', width: 40, sortable: true, renderer: resultRenderer},
      {header: 'Операции', xtype: 'textactioncolumn', width: 60, actionsSeparator: ' ',
        items: [
          {
            tooltip: 'Json запроса',
            icon: '/ico/note.png',
            isHidden: function() {
              return false;
            },
            scope: this,
            text: '',
            handler: function(grid, rowIndex) {
              var record = grid.getStore().getAt(rowIndex);
              if (!Ext.isEmpty(record.data.message_body)) {
                var eventWindow = new Ext.Window({
                  closeAction: 'close',
                  width: 600,
                  height: 400,
                  layout: 'fit',
                  title: 'Json запроса',
                  items: [
                    {
                      xtype: 'textarea',
                      value: record.data.message_body
                    }
                  ]
                });
                eventWindow.show(); 
              }
            }
          },
          {
            tooltip: 'Расшифровка запроса',
            icon: '/ico/status1.png',
            isHidden: function() {
              return false;
            },
            scope: this,
            text: '',
            handler: function(grid, rowIndex) {
              var record = grid.getStore().getAt(rowIndex);
              if (!Ext.isEmpty(record.data.decoded_message_body)) {
                var eventWindow = new Ext.Window({
                  closeAction: 'close',
                  width: 600,
                  height: 400,
                  layout: 'fit',
                  title: 'Json запроса',
                  items: [
                    {
                      xtype: 'textarea',
                      value: JSON.stringify(record.data.decoded_message_body, null, '\t')
                    }
                  ]
                });
                eventWindow.show();
              }
            }
          },
          {
            tooltip: 'Json ответа',
            icon: '/ico/notifications.png',
            isHidden: function() {
              return false;
            },
            scope: this,
            text: '',
            handler: function(grid, rowIndex) {
              var record = grid.getStore().getAt(rowIndex);
              if (!Ext.isEmpty(record.data.response_body)) {
                var eventWindow = new Ext.Window({
                  closeAction: 'close',
                  width: 600,
                  height: 400,
                  layout: 'fit',
                  title: 'Json ответа',
                  items: [
                    {
                      xtype: 'textarea',
                      value: record.data.response_body
                    }
                  ]
                });
                eventWindow.show();
              }
            }
          },
          {
            tooltip: 'Расшифровка ответа',
            icon: '/ico/report.png',
            isHidden: function() {
              return false;
            },
            scope: this,
            text: '',
            handler: function(grid, rowIndex) {
              var record = grid.getStore().getAt(rowIndex);
              if (!Ext.isEmpty(record.data.decoded_response_body)) {
                var eventWindow = new Ext.Window({
                  closeAction: 'close',
                  width: 600,
                  height: 400,
                  layout: 'fit',
                  title: 'Json ответа',
                  items: [
                    {
                      xtype: 'textarea',
                      value: JSON.stringify(record.data.decoded_response_body, null, '\t')
                    }
                  ]
                });
                eventWindow.show();
              }
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
        bbar: renderPagingToolbar('Записи', store, ETP_GRID_ROWS_LIMIT),
        loadMask: true,
        listeners: {
          render: function() {
            this.fireEvent('search');
          },
          search: function(query, search_params) {
            var store = this.getStore();
            if (search_params) {
              for (var sp in search_params) {
                store.setBaseParam(sp, search_params[sp]);
              }
            }
            store.setBaseParam('query', query);
            store.setBaseParam('start', 0);
            store.setBaseParam('limit', ETP_GRID_ROWS_LIMIT);
            store.load();
          }
        }
      }
    );

    Application.components.EtpGrid.superclass.initComponent.call(this);
  }
});
