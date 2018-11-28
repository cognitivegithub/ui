/**
 * Компонент выводит грид отклоненых заявок на аккредитацию
 *
 * Параметры:
 * 
 * type - тип контрагента (supplier/customer)
 *
 */
Ext.define('Application.components.AccreditationDeclinedGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createAccreditationDeclinedStore(this.type);
    Ext.apply(this,
    {
      store: store,
        columns: [
          {id: 'id', dataIndex: 'id', hidden: true},
          {id: 'contragent_id', dataIndex: 'contragent_id', hidden: true},
          {header: 'Инн', dataIndex: 'inn', width: 100},
          {
            xtype: 'textactioncolumn',
            header: 'Организация',
            dataIndex: 'full_name',
            width: 200,
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
          {header: 'Причина отклонения', dataIndex: 'reason_declined', width: 200},
          {header: 'Оператор', dataIndex: 'operator_name', width: 90},
          {
            xtype: 'textactioncolumn',
            header: 'Операции',
            width: 90,
            dataIndex: 'id',
            sortable: false,
            actionsSeparator: ' ',
            items: [{
              icon: '/ico/settings/browse.png',
              tooltip: "Состав заявки",
              handler: function(grid, rowIndex) {
                var store  = grid.getStore();
                var record = store.getAt(rowIndex);
                redirect_to('accreditation/view/id/'+record.id+'/type/'+this.type);
              }
            }, {
              icon: '/ico/application.png',
              tooltip: "Перерассмотреть",
              handler: function(grid, rowIndex) {
                var store  = grid.getStore();
                var record = store.getAt(rowIndex);
                performRPCCall(RPC.Accreditation.resubmit, [{id: record.id, type: this.type}], {wait_text: 'Отправка заявки на перерассмотрение...', confirm: 'Отправить заявку на перерассмотрение?'}, function(response) {
                  if (response.success) {
                    store.reload();
                  } else {
                    echoResponseMessage(response);
                  }
                });
              }
            }],
            scope: this
          }
        ],
      viewConfig: {
        forceFit: true
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по организации',
        advancedSearch: [{
          xtype: 'textfield',
          name: 'contragent_name',
          fieldLabel: 'Наименование'
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
    Application.components.AccreditationDeclinedGrid.superclass.initComponent.call(this);
  }
});
