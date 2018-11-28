/**
 * Компонент выводит грид запросов прав представительства
 *
 * Параметры:
 *
 *
 */
Application.components.RepresentationRightsGrid = Ext.extend(Ext.grid.GridPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createRepresentationRightsStore(component.requests);
    Ext.apply(this,
    {
      store: store,
        columns: [
          {id: 'id', dataIndex: 'id', hidden: true},
          {id: 'representative_id', dataIndex: 'representative_id', hidden: true},
          {
            xtype: 'textactioncolumn',
            header: 'Организация',
            dataIndex: 'full_name',
            width: 300,
            items: [
              {
                text: function(value, metaData, record) {
                  return record.data.full_name;
                },
                href: function(value, metaData, record) {
                  return href_to('company/view/id/' + record.data.representative_id);
                }
              }
            ]
          },
          {header: 'Дата подачи запроса', width: 90, dataIndex: 'date', scope: this},
          {header: 'Дата рассмотрения запроса', width: 90, dataIndex: 'date_resolved'},
          {header: 'Срок действия', width: 90, dataIndex: 'valid_for', scope: this},
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
            header: 'Операции',
            actionsSeparator: ' ',
            width: 90,
            dataIndex: 'id',
            sortable: false,
            items: [{
                icon: '/ico/accept.png',
                tooltip: "Принять",
                isHidden: function(value, metaData, record) {
                  return record.data.status != "1";
                },
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  this.fireEvent("accept", record.id);return false;
                }
              }, {
                icon: '/ico/light.png',
                tooltip: "Отклонить",
                isHidden: function(value, metaData, record) {
                  return record.data.status != "1";
                },
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  this.fireEvent("decline", record.id);return false;
                }
              }, {
                icon: '/ico/block.png',
                tooltip: "Лишить права",
                isHidden: function(value, metaData, record) {
                  return record.data.status != "3";
                },
                handler: function(grid, rowIndex) {
                  var store  = grid.getStore();
                  var record = store.getAt(rowIndex);
                  this.fireEvent("deprive", record.id);return false;
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
        accept : function(id) {
          var title = 'Подтверждение заявки на регистрацию полномочий';
          var prompt = 'Вы уверены, что хотите подтвердить заявку?';
          Ext.Msg.show({
            title: title,
            msg: prompt,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(b){
              if ('ok'==b) {
                var status = 'accept';
                var store = component.getStore();
                component.el.mask('Подождите...', 'x-mask-loading');
                RPC.Company.acceptRepresentationRequest({'id':id, 'status':status}, function(result){
                  component.el.unmask();
                  if (result.success) {
                    Ext.Msg.alert('Успешно', 'Заявка принята');
                    store.load();
                  } else {
                    Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                  }
                });
              }
            }
          }, this);
        },
        decline: function(id) {
          var title = 'Отклонение заявки на регистрацию полномочий';
          var prompt = 'Вы уверены, что хотите отклонить заявку?';
          Ext.Msg.show({
            title: title,
            msg: prompt,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(b){
              if ('ok'==b) {
                var status = 'decline';
                var store = component.getStore();
                component.el.mask('Подождите...', 'x-mask-loading');
                RPC.Company.acceptRepresentationRequest({'id':id, 'status':status}, function(result){
                  component.el.unmask();
                  if (result.success) {
                    Ext.Msg.alert('Успешно', 'Заявка отклонена');
                    store.load();
                  } else {
                    Ext.Msg.alert('Ошибка', result.message||'Ошибка связи с сервером');
                  }
                });
              }
            }
          }, this);
        },
        deprive: function(id) {
          var title = 'Лишение прав на публикацию процедур';
          var prompt = 'Вы уверены, что хотите лишить организатора права публикации процедур?';
          Ext.Msg.show({
            title: title,
            msg: prompt,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(b){
              if ('ok'==b) {
                var status = 'deprive';
                var store = component.getStore();
                component.el.mask('Подождите...', 'x-mask-loading');
                RPC.Company.acceptRepresentationRequest({'id':id, 'status':status}, function(result){
                  component.el.unmask();
                  if (result.success) {
                    Ext.Msg.alert('Успешно', 'Данный организатор больше не имеет прав на публикацию процедур');
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
    Application.components.RepresentationRightsGrid.superclass.initComponent.call(this);
  }
});
