/**
 * Компонент выводит грид предоставленных прав представительства
 *
 * Параметры:
 *
 *
 */
Application.components.RepresentedRightsGrid = Ext.extend(Ext.grid.GridPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createRepresentedRightsStore(component.requests);
    Ext.apply(this,
    {
      store: store,
        columns: [
          {id: 'id', dataIndex: 'id', hidden: true, header: 'Идентификатор заявки'},
          {id: 'contragent_id', dataIndex: 'contragent_id', hidden: true, header: 'Идентификатор контрагента'},
          {
            xtype: 'textactioncolumn',
            header: 'Организация',
            dataIndex: 'full_name',
            width: 300,
            items: [{
                text: function(value, metaData, record) {
                  return record.data.full_name;
                },
                href: function(value, metaData, record) {
                  return href_to('company/view/id/' + record.data.contragent_id);
                }
              }
            ]
          },
          {header: 'Дата подачи запроса', width: 90, dataIndex: 'date'},
          {header: 'Дата рассмотрения запроса', width: 90, dataIndex: 'date_resolved'},
          {header: 'Срок действия', width: 90, dataIndex: 'valid_for'},
          {header: 'Статус', 
            width: 90,
            dataIndex: 'status',
            renderer: function(value, metaData, record) {
              var statuses = {1: 'Не рассмотрена', 2: 'Отозвана', 3: 'Принята', 4: 'Отклонена', 5: 'Лишен права представительства'}
              return statuses[record.data.status];
            },
            scope: this
          }, {
            xtype: 'textactioncolumn',
            actionsSeparator: ' ',
            header: 'Операции',
            width: 90,
            dataIndex: 'id',
            sortable: false,
            items: [
              {
                icon: '/ico/delete.png',
                tooltip: "Отозвать",
                isHidden: function(value, metaData, record) {
                  return (record.data.status == "2" || record.data.status == "4");
                },
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  this.fireEvent("cancel", record.id);return false;
                }
              }
            ],
            scope: this
          }
        ],
      viewConfig: {
        forceFit: true
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      bbar: renderPagingToolbar('Организации', store),
      listeners: {
        cancel : function(id) {
          var title = 'Отмена заявки на регистрацию полномочий';
          var prompt = 'Вы уверены, что хотите отменить заявку?';
          Ext.Msg.show({
            title: title,
            msg: prompt,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(b){
              if ('ok'==b) {
                var store = component.getStore();
                component.el.mask('Подождите...', 'x-mask-loading');
                RPC.Company.acceptRepresentationRequest({'id':id, 'status': 'cancel'}, function(result){
                  component.el.unmask();
                  if (result.success) {
                    Ext.Msg.alert('Успешно', 'Заявка отменена');
                    store.load();
                  } else {
                    Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                  }
                });
              }
            }
          }, this);
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
    Application.components.RepresentedRightsGrid.superclass.initComponent.call(this);
  }
});
