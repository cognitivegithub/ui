
 Ext.define('Application.components.LogGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  id: 'logPanel',
  initComponent : function () {
    var component = this;
    this.addEvents('search');

    if (!this.procedure_id) {
      this.procedure_id = null;
    }
    var actionStore = new Ext.data.DirectStore({
      directFn: RPC.Log.resourcesList,
      paramsAsHash: true,
      remoteSort: false,
      autoLoad: true,
      root: 'rows',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: ['id', 'descr']
    });
    var departmentStore = createDepartmentsStore();
    departmentStore.addListener('load', function() {
      var rec = new Ext.data.Record.create([{name: 'Все'}]);
      this.insert(0, new rec({name: 'Все'}));
    });
    departmentStore.load();

    var ttbar = null;
    if (this.procedure_id==null) {
      var advancedSearch = [{
        xtype: 'dateinterval',
        name: 'date_range',
        fieldLabel: 'Дата'
      }, {
        xtype: 'textfield',
        name: 'event_id',
        fieldLabel: 'ID события'
      }, {
        xtype: 'textfield',
        name: 'procedure_id',
        fieldLabel: 'ID закупки',
        hidden: !Main.config.veb_custom
      }, {
        xtype: 'textfield',
        name: 'procedure_registry_number',
        fieldLabel: 'Реестровый номер процедуры',
        hidden: Main.config.veb_custom
      }, {
        xtype: 'textfield',
        name: 'company_name',
        fieldLabel: 'Наименование организации',
        hidden: Main.config.veb_custom
      }, {
        xtype: 'textfield',
        name: 'user_id',
        fieldLabel: 'ID пользователя'
      }, {
        xtype: 'textfield',
        name: 'user_login',
        fieldLabel: 'Логин пользователя'
      }, {
        xtype: 'textfield',
        name: 'company_inn',
        fieldLabel: 'ИНН организации',
        hidden: Main.config.veb_custom
      }];
      if (Main.config.show_additional_number) {
        advancedSearch.push({
          xtype: 'textfield',
          name: 'number_additional',
          fieldLabel: 'Номер закупки',
          hidden: Main.config.veb_custom
        });
      }
      advancedSearch.push({
        xtype: 'combo',
        store: actionStore,
        fieldLabel: 'Действие',
        name: 'path',
        displayField: 'descr',
        mode: 'local',
        triggerAction: 'all',
        editable: false,
        valueField: 'id'
      });
      advancedSearch.push({
        xtype: 'combo',
        store: departmentStore,
        fieldLabel: 'Подразделение',
        name: 'department_id',
        displayField: 'name',
        mode: 'local',
        triggerAction: 'all',
        editable: false,
        valueField: 'id'
      });
      ttbar = {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по пользователю',
        advancedSearch: advancedSearch
      };
    }

    var store = createLogStore(this.logtype, this.procedure_id);

    var grid_columns = [];
    if (!component.procedure_id) {
      grid_columns.push({header: 'ID события', width: 40, dataIndex: 'id', sortable: true});
    }
    grid_columns.push(
      {header: 'Дата и время', width: 60, dataIndex: 'timestamp', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s'), sortable: true});
    grid_columns.push({header: 'Ip', dataIndex: 'ip_address', width: 40, sortable: true});  
    grid_columns.push({header: 'ID закупки', dataIndex: 'procedure_id', width: 40, sortable: true});
    grid_columns.push(
      {header: 'Действие', dataIndex: 'pseudo', width: 120, sortable: true}
    );
    //if ((component.procedure_organizer && component.procedure_organizer == Main.user.contragent_id)) {
      grid_columns.push({header: 'Пользователь', dataIndex: 'username', width: 60, sortable: true});
    //}
    if (Main.config.departments) {
      grid_columns.push({header: 'Подразделение', dataIndex: 'department', width: 80});
    }
    grid_columns.push(
      //{header: 'Организация', dataIndex: 'company', width: 80, sortable: true},
      {header: 'Статус', dataIndex: 'status', width: 35, sortable: true}
    );

    if (component.logtype === 'eds') {
      grid_columns.push(
        {header: 'Операции', xtype: 'textactioncolumn', width: 80, actionsSeparator: ' ',
          items: [{
                tooltip: 'Подписанный текст',
                icon: '/ico/eds.png',
                isHidden: function(v, m, r) {
                  // Проверка на 'a' нужна для того, чтобы исключить отладочные подписи, подставленные с отключенным Крипто ПРО
                  return (!r.data.event_eds || r.data.event_eds === '' || r.data.event_eds === 'a');
                },
                handler: function(grid, rowIndex) {
                  var item = grid.getStore().getAt(rowIndex);
                  if (item) {
                    performRPCCall(RPC.Log.loadedslog, [{ id: item.data.id }], {wait_text: 'Получаем данные'}, function(response) {
                      var wnd_eds = new Ext.Window({
                          title: 'Подписанный текст',
                          width: 700,
                          height: 400,
                          layout: 'form',
                          bodyStyle: 'padding: 12px 10px 10px 5px',
                          labelWidth: 1,
                          hideFieldLabel: true,
                          items: [{
                            xtype: 'textarea',
                            anchor: '100%',
                            height: 312,
                            readOnly: true,
                            value: response.data
                          }],
                          buttons: [{
                            text: 'Закрыть',
                            handler: function() {
                              wnd_eds.close();
                            }
                          }]
                        });
                      wnd_eds.show();
                    });
                  }
                }
              }, {
                tooltip: 'Контейнер PKCS#7',
                icon: '/ico/sign.png',
                text: '',
                isHidden: function(v, m, r) {
                  return (!r.data.event_eds || r.data.event_eds === '' || r.data.event_eds === 'a');
                },
                handler: function(grid, rowIndex) {
                  var item = grid.getStore().getAt(rowIndex);
                  window.location = '/log/downloadeds/id/' + item.data.id;
                }
              }]
        }
      );
    } else {
      grid_columns.push({header: 'Сообщение', dataIndex: 'message', width: 60, sortable: true});
    }
    var buttons = [];
    if (this.module == 'po'){
        buttons.push({
          text: 'Выгрузить',
          handler: function() {
              var params = Ext.apply({}, store.baseParams);
              var sort = store.getSortState();
              Ext.apply(params, {
                format: 'excel',
                start: 0,
                limit: 500,
                sort: sort.field,
                dir: sort.direction
              })
              performAjaxRPCCall('/log/procedurelog', params, {download: true, wait_disable: true}, echoResponseMessage);
          }
      });
    }
    Ext.apply(this,
    {
      store: store,
      columns: grid_columns,
      viewConfig: {
        forceFit: true
      },
      tbar: ttbar,
      bbar: renderPagingToolbar('Записи', store, 50, ['-', renderStoreDownloadButton(store, 'log/index', 65000)]),
      loadMask: true,
      //buttons: buttons,
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

    Application.components.LogGrid.superclass.initComponent.call(this);
  }
});
