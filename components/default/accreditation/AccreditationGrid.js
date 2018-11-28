/**
 * Компонент выводит грид заявок на аккредитацию
 *
 * Параметры:
 * 
 * type - тип контрагента (supplier/customer)
 *
 */
Ext.define('Application.components.AccreditationGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createAccreditationStore(this.type);
    Ext.apply(this,
    {
      store: store,
        columns: [
          {id: 'id', dataIndex: 'id', hidden: true},
          {id: 'contragent_id', dataIndex: 'contragent_id', hidden: true},
          {
            xtype: 'textactioncolumn',
            header: 'Организация',
            dataIndex: 'full_name',
            width: 300,
            items: [
              {
                tooltip: 'Просмотреть',
                text: function(value, metaData, record) {
                  return record.data.full_name;
                },
                href: function(value, metaData, record) {
                  return href_to('company/profile/id/' + record.data.contragent_id + '/draft/1');
                }
              }
            ]
          },
          {header: 'Инн', dataIndex: 'inn', width: 100},
          {header: 'Email', dataIndex: 'email', width: 90},
          {header: 'Дата подачи заявки', width: 90, dataIndex: 'date', scope: this},
          {
            xtype: 'textactioncolumn',
            header: 'Операции',
            width: 90,
            dataIndex: 'id',
            sortable: false,
            items: [
              {
                icon: '/ico/settings/browse.png',
                tooltip: "Рассмотреть",
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  this.fireEvent("review", record.id, this.type);return false;
                }
              }
            ],
            scope: this
          }
        ],
      viewConfig: {
        forceFit: true,
        getRowClass : function(record){
          var c_date = new Date();
          var cur_date = new Date(c_date.getFullYear(), c_date.getMonth(), c_date.getDate());
          var rgx_date = /(\d{2})\.(\d{2})\.(\d{4})/.exec(record.data.date);
          var record_date = new Date(rgx_date[3], rgx_date[2]-1, rgx_date[1]);
          var diff = Math.floor((cur_date.getTime() - record_date.getTime()) / (1000*60*60*24));
          if (diff == 0) return 'x-color-8';
          if (diff == 1) return 'x-color-2';
          if (diff == 2) return 'x-color-6';
          if (diff == 3) return 'x-color-4';
          return 'x-color-5';
        }
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по организации',
        advancedSearch: [{
          xtype: 'dateinterval',
          name: 'date_range',
          fieldLabel: 'Дата подачи заявки'
        }, {
          xtype: 'textfield',
          name: 'contragent_name',
          fieldLabel: 'Наименование'
        }, {
          xtype: 'textfield',
          name: 'email',
          fieldLabel: 'E-mail'
        }, {
          xtype: 'textfield',
          name: 'inn',
          fieldLabel: 'ИНН'
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      bbar: renderPagingToolbar('Организации', store),
      listeners: {
        review : function(id, type) {
          redirect_to('accreditation/review/type/' + type + '/id/' + id);
        },
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
          store.setBaseParam('type', this.type);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          store.load();
        }
      }
    }
    );
    Application.components.AccreditationGrid.superclass.initComponent.call(this);
  }
});
