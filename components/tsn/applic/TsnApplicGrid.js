Ext.define('Application.components.TsnApplicGrid', {
  extend: 'Ext.grid.GridPanel',
  frame : true,
  border : false,
  id: 'TsnApplicGrid',
  initComponent : function () {
    this.addEvents('search');
    var component = this;

    var advFields = [];
    var storeParams = {};
    var actionLinks = [];

    if (component.companyType == 'my') {
      advFields.push('registry_number');
      advFields.push('date_published');
      Ext.apply(storeParams, { contragent_type: component.companyType });
      actionLinks = [
        {
          tooltip: 'Просмотреть',
          icon: '/ico/settings/browse.png',
          handler: redirectActionHandler('tsn/applic/view/id/{id}'),
          isHidden: function(v, meta, rec) {
            return false;
          }
        },
        {
          tooltip: 'Подписать',
          icon: '/ico/applics/sign_applic.png',
          handler: redirectActionHandler('tsn/applic/edit/procedure/{procedure_id}/application_id/{id}'),
          isHidden: function(v, meta, rec) {
            return !(rec.data.status == 0);
          }
        },
        /*{
          tooltip: 'Отозвать',
          icon: '/ico/applics/withdraw_applic.png',
          handler: redirectActionHandler('tsn/applic/cancel/id/{id}'),
          isHidden: function(v, meta, rec) {
            return !(rec.data.status == 1 && rec.data.lot_status == 2);
          }
        },*/
        {
          tooltip: 'Удалить',
          icon: '/ico/delete.png',
          handler: function(grid, rowIndex) {
            Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите удалить заявку?', function(r) {
              if ('yes' == r) {
                var item = grid.getAt(rowIndex);
                var template = new Ext.Template('tsn/applic/delete/id/{id}');
                if (item) {
                  redirect_to(template.apply(item.data));
                }
              }
            });
          },
          isHidden: function(v, meta, rec) {
            return !(rec.data.status == 0);
          }
        }
      ];
    } else {
      // TODO Not copy-pasted yet
    }

    var store = createApplicStore(component.directFn, storeParams, advFields);

    // Для поставщика добавляем поисковой тулбар
    var tbar;
    if (component.companyType == 'my') {
      tbar = {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по заявкам',
        advancedSearch: [
          {
            xtype: 'textfield',
            name: 'registry_number',
            fieldLabel: 'Реестровый номер процедуры'
          },
          {
            xtype: 'combo',
            name: 'status',
            fieldLabel: 'Статус заявки',
            mode: 'local',
            store : new Ext.data.ArrayStore({
              id: 0,
              fields: [
                'id',
                'name'
              ],
              data: [
                [-1, 'Все'],
                [0, 'Черновик'],
                [1, 'Подана, не рассмотрена'],
                [2, 'Отозвана до рассмотрения'],
                [3, 'Рассмотрена заказчиком, принята'],
                [4, 'Рассмотрена заказчиком, отклонена'],
                [5, 'Исполнитель уклонился от заключения ГК']
              ]
            }),
            editable: false,
            valueField: 'id',
            displayField: 'name',
            hiddenName : 'name',
            triggerAction: 'all'
          }
        ]
      };
    }

    function statusRenderer(value, meta, record) {
      var result = '';
      switch (value) {
        case 0:
          result = 'Черновик';
          break;
        case 1:
          result = 'Подана, не рассмотрена';
          break;
        case 2:
          result = 'Отозвана до рассмотрения';
          break;
        case 3:
          result = 'Рассмотрена заказчиком, принята';
          break;
        case 4:
          result = 'Рассмотрена заказчиком, отклонена';
          break;
        case 5:
          result = 'Исполнитель уклонился от заключения ГК';
          break;
      }
      return result;
    }

    function dateRenderer(format) {
      return function(v) {
        v = parseDate(v);
        if (!v) {
          return '—';
        }
        return Ext.util.Format.date(v, format);
      };
    }

    var cols = [];
    cols.push({header: 'Реестровый №', dataIndex: 'registry_number', width: 50});
    cols.push({header: 'Название процедуры', dataIndex: 'procedure_title', width: 150});
    cols.push({header: 'Дата подачи', dataIndex: 'date_published', width: 40, renderer: dateRenderer('d.m.Y H:i')});
    cols.push({header: 'Текущий статус', dataIndex: 'status', width: 70, renderer: statusRenderer});
    if (component.companyType != 'my') {
      cols.push({header: 'Наименование заявителя', dataIndex: 'supplier_name', width: 150});
    }
    cols.push({header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', items: actionLinks, width: 40});

    Ext.apply(this, {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: cols
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: renderPagingToolbar('Заявки', store),
      tbar: tbar,
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (this.companyType == 'my') {
            if (search_params) {
              for (var sp in search_params)
                store.setBaseParam(sp, search_params[sp]);
            }
            store.setBaseParam('query', query);
            store.setBaseParam('start', 0);
            store.setBaseParam('limit', 25);
          }
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    });
    Application.components.TsnApplicGrid.superclass.initComponent.call(this);
  }
});
