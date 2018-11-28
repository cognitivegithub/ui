
 Ext.define('Application.components.HolidaysGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createHolidaysStore();

    var dt = new Date();
    var cur_year = dt.getFullYear();
    var low_year = cur_year-3;
    var arr_years = [];
    for(var cnt_year=cur_year; cnt_year>low_year; cnt_year--) {
      arr_years.push([cnt_year, cnt_year]);
    }

    function rendererWorkday(val) {
      return (val ? 'рабочий' : 'выходной');
    }

    Ext.apply(this,
    {
      store: store,
      columns: [
          {header: 'День', width: 150, dataIndex: 'date'},
          {header: 'Рабочий', width: 50, dataIndex: 'is_workday', renderer: rendererWorkday},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ',
            items:[{
              tooltip: 'Изменить',
              icon: '/ico/edit.png',
              handler: function(grid, rowIndex, colIndex) {
                var store = grid.getStore();
                var record = store.getAt(rowIndex);
                var win = new Ext.Window({
                  closeAction: 'hide',
                  width: 400,
                  autoHeight: true,
                  title: 'Дата '+record.data.date,
                  items: [
                    {
                      xtype: 'Application.components.HolidaysForm',
                      date_id: record.id,
                      close_fn: function() {
                        win.close();
                      },
                      save_fn: function() {
                        store.load();
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
        getRowClass : function(record){
          return (record.data.is_workday ? 'x-color-4' : 'x-color-2');
        },
        forceFit: true
      },
      tbar: [{
        text: 'Добавить',
        cls: 'x-btn-text-icon',
        icon: '/ico/add.png',
        handler: function() {
          var win_new = new Ext.Window({
            closeAction: 'close',
            width: 400,
            autoHeight: true,
            title: 'Новая дата',
            items: [
              {
                xtype: 'Application.components.HolidaysForm',
                date_id: null,
                close_fn: function() {
                  win_new.close();
                },
                save_fn: function() {
                  store.load();
                  win_new.close();
                }
              }
            ]
          });
          win_new.show();
        }
      }, '->', {
        xtype: 'combo',
        fieldLabel: 'Тип',
        mode: 'local',
        store : new Ext.data.ArrayStore({
            id: 0,
            fields: [
              'year',
              'name'
            ],
            data: arr_years
        }),
        editable: false,
        valueField: 'year',
        displayField: 'name',
        hiddenName : 'year',
        triggerAction: 'all',
        emptyText: 'Фильтр по году',
        listeners: {
          select: function(obj, rec) {
            component.updateGridStore(rec.data.year);
          },
          render: function(obj) {
            obj.setValue(cur_year);
            component.updateGridStore(cur_year);
          }
        }
      }],
      bbar: renderPagingToolbar('Записи', store, 50),
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true
    }
    );

    Application.components.HolidaysGrid.superclass.initComponent.call(this);
  },
  updateGridStore: function(year) {
    var store = this.getStore();
    store.setBaseParam('year', year);
    store.load();
  }
});
