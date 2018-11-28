Ext.define('Application.components.CompanyGrid', {
  extend : 'Ext.grid.Panel',
  frame : true,
  border : false,
  module:'com',
  name: 'contragents-search',

  type: null, //customer|supplier
  storeParams: {},
  drawOperations: ['Просмотреть','Редактировать','Настроить','Блокировать','Разблокировать','Причина блокировки','Департаменты','Пользователи','Добавить пользователя','Финансовые операции','История операций','Добавить в очередь синхронизации','Список процедур','Вышестоящая организация'],
  drawSearch: ['query', 'type', 'inn','kpp','ogrn','status','supplier_profile_id','customer_profile_id','account'],
  drawColumns: ['id', 'account','guid','full_name','customer_profile_name','supplier_profile_name','status','inn','kpp','date_added', 'small_biz', 'drawOperations'],

  initComponent : function () {
    var component = this;
    this.addEvents('search');
    this.addEvents('change_access');
    var store = createCompanyStore(this.type, this.storeParams);
    var search_toolbar_id = Ext.id();
    store.setDefaultSort('id', 'DESC');
    var customer_profile_store = createProfilesStore('customer');
    var supplier_profile_store = createProfilesStore('supplier');

    function renderStatus(value) {
      var result = 'Не авторизован';
      if (value == 2) result = 'Авторизован';
      if (value == 3) result = 'Заблокирован';
      if (value == 4) result = 'Заблокирован для подтверждения итогов';
      return result;
    }
    
    function yesnoCompanyRender(v, m, r, l) {
      return (v == undefined || !v) ? 'Нет' : 'Да';
    }

    function renderInn(value, meta, record) {
      if (record.data.rnp && record.data.rnp==true) {
        return value+'&nbsp;<a class="rnp_present" title="По состоянию на '+new Date().format('d.m.Y')
            +' данный участник находится в реестре недобросовестных поставщиков в соответствии' +
            ' со ст. 19 94-ФЗ/ст. 104 44-ФЗ/ст. 5 223-ФЗ. Информация из реестра недобросовестных' +
            ' поставщиков обновляется на электронной площадке 1 раз в день. Рекомендуем ' +
            'сверять информацию на сайтах: http://rnp.fas.gov.ru/ и ' +
            'http://zakupki.gov.ru/"></a>';
      } else {
        return value;
      }
    }

    Ext.apply(this,
    {
      store: store,
      columns: [
          {header: 'ИД', dataIndex: 'id', width: 40, sortable: true},
          {header: 'Л/с', dataIndex: 'account', width: 70, sortable: true},
          {header: 'GUID', dataIndex: 'guid', width: 70, sortable: false, hidden: true},
          {header: 'Название организации', dataIndex: 'full_name', width: 200, sortable: true},
          {header: 'Аккредитация заказчика', dataIndex: 'customer_profile_name', width: 100, sortable: true},
          {header: 'Аккредитация заявителя', dataIndex: 'supplier_profile_name', width: 110, sortable: true},
          {header: 'Статус', dataIndex: 'status', width: 70, renderer: renderStatus, sortable: true},
          {header: 'ИНН', dataIndex: 'inn', width: 70, renderer: renderInn, sortable: true},
          {header: 'КПП', dataIndex: 'kpp', width: 70, sortable: true},
          {header: 'Дата регистрации', width: 70, dataIndex: 'date_added', renderer: function (v) {return ''}, sortable: true},
          {header: 'СМСП', dataIndex: 'small_biz', width: 20, renderer: yesnoCompanyRender, sortable: true},
          {header: 'Операции', dataIndex: 'drawOperations', xtype: 'textactioncolumn', actionsSeparator: ' ', width: 95, items: this.getOperations()}
      ],
      viewConfig: {
        forceFit: true
      },
      bbar: this.getBottomToolbarConfig(store),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по названию организации, ИНН, ид или л/с',
        id: search_toolbar_id,
        advancedSearch: [
          {
            xtype: 'textfield',
            fieldLabel: 'Название',
            name: 'query'
          },
          {
            xtype: 'combo',
            name: 'type',
            fieldLabel: 'Тип организации',
            mode: 'local',
            store : new Ext.data.ArrayStore({
                //id: 0,
                fields: [
                    'id',
                    'name'
                ],
                data: [
                  ['', 'Все'],
                  ['customer', 'Заказчик'],
                  ['supplier', 'Заявитель']
                ]
            }),
            editable: false,
            valueField: 'id',
            displayField: 'name',
            hiddenName : 'name',
            triggerAction: 'all'
          },
          {
            xtype: 'textfield',
            fieldLabel: 'ИНН',
            name: 'inn'
          }, {
            xtype: 'textfield',
            fieldLabel: 'КПП',
            name: 'kpp'
          }, {
            xtype: 'textfield',
            fieldLabel: 'ОГРН',
            name: 'ogrn'
          }, {
            xtype: 'combo',
            name: 'status',
            fieldLabel: 'Статус',
            mode: 'local',
            store : new Ext.data.ArrayStore({
                //id: 0,
                fields: [
                    'id',
                    'name'
                ],
                data: [
                  [1, 'Не авторизован'],
                  [2, 'Авторизован'],
                  [3, 'Заблокирован']
                ]
            }),
            editable: false,
            valueField: 'id',
            displayField: 'name',
            triggerAction: 'all'
          }, {
            xtype: 'combo',
            name: 'customer_profile_id',
            valueField: 'id',
            displayField: 'name',
            fieldLabel: 'Тип заказчика',
            mode: 'local',
            store: customer_profile_store,
            editable: false,
            triggerAction: 'all'
          }, {
            xtype: 'combo',
            name: 'supplier_profile_id',
            valueField: 'id',
            displayField: 'name',
            fieldLabel: 'Тип заявителя',
            mode: 'local',
            store: supplier_profile_store,
            editable: false,
            triggerAction: 'all'
          }, {
            xtype: 'textfield',
            fieldLabel: 'Ид или л/с',
            name: 'account'
          }, {
            xtype: 'textfield',
            fieldLabel: 'GUID',
            name: 'guid'
          }
        ]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      plugins: [Ext.ux.plugins.Stateful],
      listeners: {
        render: function() {
          var search_toolbar = Ext.getCmp(search_toolbar_id);
          search_toolbar.doSearch();
          customer_profile_store.load();
          supplier_profile_store.load();
        },
        search: function(query, search_params) {
          var store = this.getStore();
          //store.setBaseParam('query', query);
          //store.setBaseParam('status', 2);
          //store.baseParams = {};
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          if (query) {
            if (Ext.isString(query)) {
              store.setBaseParam('query', query);
            }
          } else {
            store.setBaseParam('query', null);
          }
          if (search_params) {
            for (var sp in search_params) {
              if (!search_params.hasOwnProperty(sp)) {
                continue;
              }
              store.setBaseParam(sp, search_params[sp]);
            }
          }
          component.el.mask('Загрузка...', 'x-mask-loading');
          store.load({callback: function() {
            component.el.unmask();
          }});
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );
    this.columns = treatmentByOptions(this.columns, 'dataIndex', this.drawColumns);
    this.tbar.advancedSearch = treatmentByOptions(this.tbar.advancedSearch, 'name', this.drawSearch);

    Application.components.CompanyGrid.superclass.initComponent.call(this);
  },

  getOperations: function () {
    var operators = [
      {
        tooltip: 'Просмотреть',
        icon: '/ico/settings/browse.png',
        text: '',
        pseudo: 'company/profile',
        scope: 'item',
        isHidden: function () {
          return false;
        },
        href: hrefAction('company/view/id/{id}')

      },
      {
        tooltip: 'Редактировать',
        icon: '/ico/edit.png',
        text: '',
        pseudo: 'company/edit',
        scope: 'item',
        isHidden: function () {
          return false;
        },
        href: hrefAction('company/edit/id/{id}')
      },
      {
        tooltip: 'Удалить',
        icon: '/ico/delete.png',
        text: '',
        handler: function (grid, rowIndex) {
          var item = grid.getAt(rowIndex);
          if (item) {
            Ext.Msg.confirm('Подтверждение', 'Вы действительно хотите удалить компанию ' + item.json.full_name +'?',
              function(cbtn) {
                if ('yes' == cbtn) {
                  performRPCCall(RPC.Company.remove, [{ id: item.data.id }], {wait_text: 'Удаление...'}, function(response) {
                    if (response.success) {
                      grid.getStore().reload();
                      echoResponseMessage(response);
                    } else {
                      echoResponseMessage(response);
                    }
                  });
                }
              }
            );
          }
        },
        isHidden: function () {
          return false;
        }
      }
    ];

    return treatmentByOptions(operators, 'tooltip', this.drawOperations)

  },

  getBottomToolbarConfig: function (store) {
    var pagingToolbar = renderPagingToolbar('Контрагенты', store, 50, ['-', {}], true);
    var addButton = function(title, icon, functionHandler) {
      pagingToolbar.items.push('-');
      pagingToolbar.items.push({
        text: title,
        cls: 'x-btn-text-icon',
        icon: icon,
        handler: functionHandler,
        scope: this
      });
    };
    // addButton('Отправить в 1С', '/ico/sign.png', function() {});
    addButton('Добавить контрагента', '/ico/add.png', function() {
      redirect_to('company/add');
    });

    return pagingToolbar;
  }
});
